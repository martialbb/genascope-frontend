// src/components/AISessionComponent.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, isTokenExpired, getAuthToken } from '../utils/auth';
import { apiService } from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  message_type: 'question' | 'response' | 'summary' | 'assessment' | 'clarification';
  created_at: string;
  confidence_score?: number;
}

interface ChatSession {
  id: string;
  strategy_id: string;
  patient_id: string;
  session_type: 'screening' | 'assessment' | 'follow_up' | 'consultation';
  status: 'active' | 'completed' | 'paused' | 'error' | 'cancelled';
  started_at: string;
  last_activity: string;
  message_count?: number;
  progress_percentage?: number;
}

interface AISessionProps {
  isNewSession?: boolean;
}

const AISessionComponent: React.FC<AISessionProps> = ({ isNewSession = false }) => {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const startNewSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if user is authenticated
      const token = getAuthToken();
      if (!token || isTokenExpired(token)) {
        setError('Please authenticate to start a chat session. Use a valid patient invite link to access this feature.');
        setIsLoading(false);
        return;
      }

      // Get current user info
      const user = getCurrentUser(token);
      const patientId = user?.patient_id || user?.id; // use id field which contains the actual patient_id
      
      if (!patientId) {
        setError('Unable to identify patient information. Please ensure you accessed this page through a valid invite link.');
        setIsLoading(false);
        return;
      }

      // Start a new AI chat session using the API service
      // Note: In production, strategy_id should be determined by the use case
      const sessionData: ChatSession = await apiService.startAIChatSession({
        strategy_id: 'strategy-1', // Using Genetic Counseling Assessment strategy
        patient_id: patientId,
        session_type: 'screening',
        initial_context: {
          source: 'simplified_access',
          timestamp: new Date().toISOString()
        }
      });
      setSession(sessionData);

      // Load initial messages for the session
      await loadMessages(sessionData.id);

    } catch (err: any) {
      console.error('Error starting session:', err);
      if (err.response?.status === 404) {
        setError('Chat service temporarily unavailable. Please try again later or contact support.');
      } else if (err.response?.status === 401) {
        setError('Your session has expired. Please authenticate again using your invite link.');
      } else {
        setError(err.message || 'Failed to start chat session. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      const messagesData: Message[] = await apiService.getAISessionMessages(sessionId);
      setMessages(messagesData);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  }, []);

  const sendMessage = useCallback(async () => {
    if (!session || !userInput.trim() || isSending) return;

    setIsSending(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token || isTokenExpired(token)) {
        setError('Session expired. Please authenticate again.');
        return;
      }

      // Add user message to UI immediately
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: userInput,
        message_type: 'response',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      setUserInput('');

      // Send message to AI using API service
      const aiResponse: Message = await apiService.sendAIMessage(session.id, {
        message: userInput.trim(),
        message_metadata: {
          timestamp: new Date().toISOString()
        }
      });
      
      // Replace temp user message and add AI response
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== userMessage.id);
        return [...filtered, 
          { ...userMessage, id: `user-${Date.now()}` }, 
          aiResponse
        ];
      });

    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
      // Remove the temporary user message on error
      setMessages(prev => prev.filter(msg => msg.id !== `temp-${Date.now()}`));
    } finally {
      setIsSending(false);
    }
  }, [session, userInput, isSending]);

  useEffect(() => {
    if (isNewSession) {
      startNewSession();
    }
  }, [isNewSession, startNewSession]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Starting your AI assessment session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="text-red-500 mb-4 text-center">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium mt-2">Session Error</h3>
        </div>
        <p className="text-gray-700 text-center mb-6">{error}</p>
        <div className="text-center">
          {error.includes('authenticate') || error.includes('expired') ? (
            <>
              <a 
                href="/patient-access" 
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 mr-4 inline-block"
              >
                Patient Access
              </a>
              <a href="/" className="text-blue-600 hover:text-blue-800">
                Return to homepage
              </a>
            </>
          ) : (
            <>
              <button 
                onClick={startNewSession}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 mr-4"
              >
                Try Again
              </button>
              <a href="/" className="text-blue-600 hover:text-blue-800">
                Return to homepage
              </a>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-600 mb-4">No active session found.</p>
        <button 
          onClick={startNewSession}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Start New Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      {/* Session Header */}
      <div className="p-4 border-b border-gray-200 bg-blue-50">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">AI Assessment Session</h2>
            <p className="text-sm text-gray-600">
              Session Status: <span className="capitalize font-medium">{session.status}</span>
              {session.progress_percentage && (
                <span> • Progress: {Math.round(session.progress_percentage)}%</span>
              )}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Started: {new Date(session.started_at).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Welcome to your AI-powered cancer risk assessment.</p>
            <p className="text-sm mt-2">The AI will guide you through questions to assess your risk factors.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <div className="text-xs mt-1 opacity-75">
                  {new Date(message.created_at).toLocaleTimeString()}
                  {message.confidence_score && (
                    <span className="ml-2">
                      Confidence: {Math.round(message.confidence_score * 100)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        {isSending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span>AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your response here..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={2}
            disabled={isSending || session.status !== 'active'}
          />
          <button
            onClick={sendMessage}
            disabled={!userInput.trim() || isSending || session.status !== 'active'}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default AISessionComponent;

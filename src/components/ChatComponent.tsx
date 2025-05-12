// src/components/ChatComponent.tsx
import React, { useState, useEffect } from 'react';
import apiService, { type ChatQuestion } from '../services/api';

interface Message {
  sender: 'bot' | 'user';
  text: string;
}

interface ChatProps {
  sessionId: string;
}

const ChatComponent: React.FC<ChatProps> = ({ sessionId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<ChatQuestion | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startChat = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiService.startChat(sessionId);
        if (response.question) {
            setCurrentQuestion(response.question);
            setMessages([{ sender: 'bot', text: response.question.text }]);
        } else {
            setError("Could not start chat session.");
        }
      } catch (err) {
        console.error('Error starting chat:', err);
        setError('Failed to connect to the chat service. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    startChat();
  }, [sessionId]);

  const handleSubmit = async () => {
    if (!userInput.trim() || !currentQuestion || isLoading) return; // Prevent multiple submissions

    const userMessage: Message = { sender: 'user', text: userInput };
    const currentAnswer = userInput;
    const questionId = currentQuestion.id;

    // Add user message immediately for responsiveness
    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true); // Indicate loading for API call
    setError(null);
    setCurrentQuestion(null); // Temporarily hide input while waiting for response

    try {
      const response = await apiService.submitAnswer({
        sessionId,
        questionId: questionId,
        answer: currentAnswer,
      });

      if (response.nextQuestion) {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: response.nextQuestion?.text || 'Next question' },
        ]);
        setCurrentQuestion(response.nextQuestion);
      } else {
        // Chat finished
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: 'Thank you! Your responses have been recorded.' },
        ]);
        setCurrentQuestion(null); // Keep input hidden
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError('Sorry, there was an error submitting your answer. Please try again.');
      // Re-add user message and show input again on error
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Sorry, there was an error submitting your answer. Please try again.' }]);
      setCurrentQuestion(currentQuestion); // Restore the question context
    } finally {
      setIsLoading(false);
    }
  };

   const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-100 rounded-lg shadow-md max-w-2xl mx-auto">
      <div className="flex flex-col gap-3 h-96 overflow-y-auto pr-2"> {/* Chat history container */}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-[80%] ${
              msg.sender === 'bot'
                ? 'bg-blue-500 text-white self-start'
                : 'bg-green-500 text-white self-end'
            }`}
          >
            {msg.text}
          </div>
        ))}
        {/* Display loading indicator during API calls */} 
        {isLoading && messages.length > 0 && (
            <div className="self-start text-gray-500 italic">Bot is typing...</div>
        )}
      </div>

      {/* Display error message if API call fails */} 
      {error && (
          <p className="text-sm text-red-600 px-1">{error}</p>
      )}

      {/* Only show input if not loading and there is a current question */} 
      {!isLoading && currentQuestion && (
        <div className="flex gap-2 border-t pt-4"> {/* Input area */}
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your response..."
            aria-label="Chat input"
            disabled={isLoading} // Disable input while loading
          />
          <button
            onClick={handleSubmit}
            className={`bg-green-600 hover:bg-green-700 text-white p-2 rounded-md px-4 transition-colors duration-200 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label="Send message"
            disabled={isLoading} // Disable button while loading
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      )}
      {/* Display chat finished message */} 
      {!isLoading && !currentQuestion && messages.length > 0 && !error && (
         <p className="text-center text-gray-600 mt-4">Chat finished.</p>
      )}
      {/* Initial loading state */} 
      {isLoading && messages.length === 0 && (
          <p className="text-center text-gray-500">Loading chat...</p>
      )}
    </div>
  );
};

export default ChatComponent;

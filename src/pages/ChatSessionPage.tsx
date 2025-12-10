import React from 'react';
import { useSearchParams } from 'react-router-dom';
import AISessionComponent from '../components/AISessionComponent';

const ChatSessionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isNewSession = searchParams.get('new') === 'true';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Health Assessment Chat</h1>
          <p className="mt-2 text-sm text-gray-600">
            Have a conversation with our AI to assess your health risks
          </p>
        </div>
        <AISessionComponent isNewSession={isNewSession} />
      </div>
    </div>
  );
};

export default ChatSessionPage;

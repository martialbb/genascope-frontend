import React from 'react';
import SidebarLayout from '../components/SidebarLayout';
import { ChatConfigurationManager } from '../components/chat/ChatConfigurationManager';

export const ChatConfigurationPage: React.FC = () => {
  return (
    <SidebarLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Chat Configuration</h1>
        <ChatConfigurationManager />
      </div>
    </SidebarLayout>
  );
};

export default ChatConfigurationPage;

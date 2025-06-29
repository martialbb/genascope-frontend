// Chat Configuration Page - Main entry point for chat configuration functionality
// Uses the modular ChatConfigurationManager component architecture

import React from 'react';
import { ChatConfigurationManager } from './chat/ChatConfigurationManager';

const ChatConfigurationPage: React.FC = () => {
  return <ChatConfigurationManager />;
};

export default ChatConfigurationPage;

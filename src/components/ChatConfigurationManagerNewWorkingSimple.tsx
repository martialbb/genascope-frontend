// Refactored Chat Configuration Manager - now using modular component architecture
// This replaces the original 2189-line monolithic component

import React from 'react';
import { ChatConfigurationManager } from './chat/ChatConfigurationManager';

const ChatConfigurationManagerNewWorkingSimple: React.FC = () => {
  return <ChatConfigurationManager />;
};

export default ChatConfigurationManagerNewWorkingSimple;

import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import LoginForm from './LoginForm';

const LoginFormWrapper: React.FC = () => (
  <AuthProvider>
    <LoginForm />
  </AuthProvider>
);

export default LoginFormWrapper;


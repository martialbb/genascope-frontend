import React from 'react';
import SimpleLogin from '../components/SimpleLogin';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <SimpleLogin />
      </div>
    </div>
  );
};

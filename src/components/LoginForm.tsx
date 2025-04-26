// src/components/LoginForm.tsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Adjust path as needed

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { login, error, loading } = useContext(AuthContext);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !password) return;
    await login(email, password);
    // Redirect on success is handled by AuthContext or page logic
  };

  return (
    <div className="max-w-sm mx-auto bg-white p-6 rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-semibold text-center mb-6 text-gray-700">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Email"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Password"
          />
        </div>
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        <div>
          <button
            type="submit"
            disabled={loading}
            // Apply btn-primary class
            className={`w-full btn-primary ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;

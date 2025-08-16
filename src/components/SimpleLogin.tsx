import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../services/apiConfig';

interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id?: string;
}

interface UserData {
  id: string;
  email: string;
  role: string;
  name?: string;
  account_id?: string;
}

const SimpleLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('authUser');
    
    if (token && user) {
      console.log('User already logged in, redirecting to dashboard');
      window.location.href = '/dashboard';
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting login process...');
      
      // Prepare login request
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);
      params.append('grant_type', 'password');

      const apiBaseUrl = API_CONFIG.baseUrl;
      console.log('API Base URL:', apiBaseUrl);

      // Step 1: Get access token
      const tokenResponse = await fetch(`${apiBaseUrl}/api/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Login failed: ${tokenResponse.status} - ${errorText}`);
      }

      const tokenData: LoginResponse = await tokenResponse.json();
      console.log('Token received successfully');

      // Step 2: Get user details
      const userResponse = await fetch(`${apiBaseUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      });

      if (!userResponse.ok) {
        throw new Error(`Failed to fetch user data: ${userResponse.status}`);
      }

      const userDetails = await userResponse.json();
      console.log('User details received:', userDetails);

      // Step 3: Create user object
      const userData: UserData = {
        id: userDetails.id || tokenData.user_id || 'unknown',
        email: email,
        name: userDetails.name || email.split('@')[0],
        role: userDetails.role || 'user',
        account_id: userDetails.account_id
      };

      // Step 4: Store authentication data
      localStorage.setItem('authToken', tokenData.access_token);
      localStorage.setItem('authUser', JSON.stringify(userData));

      console.log('Login successful!', userData);
      setSuccess(true);

      // Step 5: Redirect to dashboard after a brief delay
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);

    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setError(null);
    setSuccess(false);
    console.log('Auth data cleared');
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-20">
        <div className="text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-semibold text-green-600 mb-4">Login Successful!</h2>
          <p className="text-gray-600 mb-4">Redirecting to dashboard...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-20">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Sign In</h2>
      
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your password"
            required
            disabled={loading}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md font-medium text-white transition-colors ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Signing In...
            </div>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Test Credentials: admin@testhospital.com / Admin123!
        </p>
        <button
          onClick={clearAuth}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Clear Auth Data
        </button>
      </div>
    </div>
  );
};

export default SimpleLogin;

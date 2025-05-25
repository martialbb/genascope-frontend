// src/components/CreateAccountForm.tsx
import React, { useState } from 'react';
import apiService from '../services/api';

const CreateAccountForm: React.FC = () => {
  const [accountName, setAccountName] = useState<string>('');
  const [domain, setDomain] = useState<string>('');
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminName, setAdminName] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    // Validate passwords match
    if (adminPassword !== adminConfirmPassword) {
      setError('Passwords do not match');
      setSubmitting(false);
      return;
    }

    console.log('Submitting new account:', { accountName, domain, adminEmail });

    try {
      const response = await apiService.createAccount({
        name: accountName,
        domain: domain,
        admin_email: adminEmail,
        admin_name: adminName,
        admin_password: adminPassword,
        admin_confirm_password: adminConfirmPassword,
      });

      setSuccess(`Account "${accountName}" created successfully.`);
      setAccountName('');
      setDomain('');
      setAdminEmail('');
      setAdminName('');
      setAdminPassword('');
      setAdminConfirmPassword('');
    } catch (err: any) {
      console.error('Error creating account:', err);

      // Handle the error properly to avoid React rendering issues
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          // Join multiple validation errors
          setError(err.response.data.detail.map((e: any) => e.msg).join(', '));
        } else if (typeof err.response.data.detail === 'object') {
          // Handle object-type errors
          setError(JSON.stringify(err.response.data.detail));
        } else {
          // Handle string error
          setError(err.response.data.detail);
        }
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-700">Create New Account</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-4">
          <p className="text-sm">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="accountName" className="block text-sm font-medium text-gray-600 mb-1">Account Name</label>
          <input
            type="text"
            id="accountName"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="domain" className="block text-sm font-medium text-gray-600 mb-1">Domain</label>
          <input
            type="text"
            id="domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-600 mb-1">Admin Email</label>
          <input
            type="email"
            id="adminEmail"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="adminName" className="block text-sm font-medium text-gray-600 mb-1">Admin Name</label>
          <input
            type="text"
            id="adminName"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-600 mb-1">Admin Password</label>
          <input
            type="password"
            id="adminPassword"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="adminConfirmPassword" className="block text-sm font-medium text-gray-600 mb-1">Confirm Password</label>
          <input
            type="password"
            id="adminConfirmPassword"
            value={adminConfirmPassword}
            onChange={(e) => setAdminConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            submitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {submitting ? 'Creating...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
};

export default CreateAccountForm;

// src/components/CreateAccountForm.tsx
import React, { useState } from 'react';
import apiService from '../services/api';

const CreateAccountForm: React.FC = () => {
  const [accountName, setAccountName] = useState<string>('');
  const [domain, setDomain] = useState<string>('');
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminName, setAdminName] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    console.log('Submitting new account:', { accountName, domain, adminEmail });

    try {
      const response = await apiService.createAccount({
        name: accountName,
        domain: domain,
        admin_email: adminEmail,
        admin_name: adminName,
        admin_password: adminPassword,
      });

      setSuccess(`Account "${accountName}" created successfully.`);
      setAccountName('');
      setDomain('');
      setAdminEmail('');
      setAdminName('');
      setAdminPassword('');
    } catch (err: any) {
      console.error('Error creating account:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to create account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-700">Create New Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="accountName" className="block text-sm font-medium text-gray-600 mb-1">Account Name</label>
          <input
            type="text"
            id="accountName"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Account Name"
          />
        </div>
        <div>
          <label htmlFor="domain" className="block text-sm font-medium text-gray-600 mb-1">Organization Domain</label>
          <input
            type="text"
            id="domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            required
            placeholder="hospital.org"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Organization Domain"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Admin Email"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Admin Name"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Admin Password"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}
        <div>
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
          >
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAccountForm;

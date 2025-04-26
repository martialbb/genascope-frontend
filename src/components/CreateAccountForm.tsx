// src/components/CreateAccountForm.tsx
import React, { useState } from 'react';
import axios from 'axios'; // Import axios

const CreateAccountForm: React.FC = () => {
  const [accountName, setAccountName] = useState<string>('');
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    console.log('Submitting new account:', { accountName, adminEmail });

    try {
      // Replace placeholder with actual API call
      const response = await axios.post('/api/admin/create_account', { accountName, adminEmail });

      // Assuming API returns success message or relevant data
      setSuccess(response.data.message || `Account "${accountName}" created successfully.`);
      setAccountName('');
      setAdminEmail('');
    } catch (err: any) {
      console.error('Error creating account:', err);
      // Use error message from API response if available
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
          <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-600 mb-1">Account Admin Email</label>
          <input
            type="email"
            id="adminEmail"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Account Admin Email"
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

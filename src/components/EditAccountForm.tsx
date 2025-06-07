// src/components/EditAccountForm.tsx
import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

interface EditAccountFormProps {
  accountId: string;
}

interface Account {
  id: string;
  name: string;
  status: string;
}

const EditAccountForm: React.FC<EditAccountFormProps> = ({ accountId }) => {
  const [account, setAccount] = useState<Account | null>(null);
  const [name, setName] = useState<string>('');
  const [status, setStatus] = useState<string>('active');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchAccountDetails();
  }, [accountId]);

  const fetchAccountDetails = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAccountById(accountId);
      setAccount(data);
      setName(data.name);
      setStatus(data.status);
      setError(null);
    } catch (err: any) {
      setError('Failed to load account details. Please try again.');
      console.error('Error fetching account:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await apiService.updateAccount(accountId, {
        name,
        status
      });

      setSuccess('Account updated successfully.');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to update account. Please try again.');
      console.error('Error updating account:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading account details...</p>
      </div>
    );
  }

  if (!account && !loading) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        Account not found or you don't have permission to edit it.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-700">Edit Account</h2>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">
            Account Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-600 mb-1">
            Account Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={submitting}
            className={`w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? 'Updating...' : 'Update Account'}
          </button>

          <a
            href="/admin/accounts"
            className="w-full bg-gray-200 text-center text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
};

export default EditAccountForm;

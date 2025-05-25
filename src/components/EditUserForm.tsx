// src/components/EditUserForm.tsx
import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

interface EditUserFormProps {
  userId: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  account_id?: string;
}

const EditUserForm: React.FC<EditUserFormProps> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const data = await apiService.getUserById(userId);
      setUser(data);
      setName(data.name);
      setEmail(data.email);
      setRole(data.role);
      setIsActive(data.is_active);
      setError(null);
    } catch (err: any) {
      setError('Failed to load user details. Please try again.');
      console.error('Error fetching user:', err);
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
      await apiService.updateUser(userId, {
        name,
        email,
        role,
        is_active: isActive
      });

      setSuccess('User updated successfully.');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to update user. Please try again.');
      console.error('Error updating user:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading user details...</p>
      </div>
    );
  }

  if (!user && !loading) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        User not found or you don't have permission to edit them.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-700">Edit User</h2>

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
            Name
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
          <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-600 mb-1">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="clinician">Clinician</option>
            <option value="patient">Patient</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            id="is-active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is-active" className="ml-2 block text-sm text-gray-900">
            Active User
          </label>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={submitting}
            className={`w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? 'Updating...' : 'Update User'}
          </button>

          <a
            href="/admin/users"
            className="w-full bg-gray-200 text-center text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
};

export default EditUserForm;

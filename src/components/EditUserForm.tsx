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
      console.log('Form Debug: Submitting user update with values:', { name, email, role, is_active: isActive });
      
      // Create update object with only modified fields
      const updateData: any = {};
      
      // Only include fields that are different from the original user
      if (user?.name !== name) updateData.name = name;
      if (user?.email !== email) updateData.email = email;
      if (user?.role !== role) updateData.role = role;
      if (user?.is_active !== isActive) updateData.is_active = isActive;
      
      if (Object.keys(updateData).length === 0) {
        setSuccess('No changes detected.');
        setSubmitting(false);
        return;
      }
      
      // Log the exact data being sent
      console.log('Form Debug: Update data object:', JSON.stringify(updateData, null, 2));
      
      // Send the update request
      const updatedUser = await apiService.updateUser(userId, updateData);

      console.log('Form Debug: Updated user response:', JSON.stringify(updatedUser, null, 2));
      
      // Check if this is the current user updating their own profile
      const currentUserData = localStorage.getItem('authUser');
      let isCurrentUser = false;
      if (currentUserData) {
        try {
          const currentUser = JSON.parse(currentUserData);
          isCurrentUser = currentUser.id === userId;
        } catch (e) {
          console.error('Error parsing current user data:', e);
        }
      }
      
      // Validate the response contains the expected changes
      let allChangesApplied = true;
      let changeResults = [];
      
      if ('name' in updateData && updatedUser.name !== updateData.name) {
        allChangesApplied = false;
        changeResults.push(`Name: expected "${updateData.name}", got "${updatedUser.name}"`);
      }
      
      if ('role' in updateData && updatedUser.role !== updateData.role) {
        allChangesApplied = false;
        changeResults.push(`Role: expected "${updateData.role}", got "${updatedUser.role}"`);
      }
      
      if ('is_active' in updateData && updatedUser.is_active !== updateData.is_active) {
        allChangesApplied = false;
        changeResults.push(`Active status: expected "${updateData.is_active}", got "${updatedUser.is_active}"`);
      }
      
      // Update local state with the response data
      setUser(updatedUser);
      setName(updatedUser.name);
      setEmail(updatedUser.email);
      setRole(updatedUser.role);
      setIsActive(updatedUser.is_active);
      
      // If this is the current user, update localStorage to refresh the header
      if (isCurrentUser) {
        const updatedUserData = {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          account_id: updatedUser.account_id
        };
        
        localStorage.setItem('authUser', JSON.stringify(updatedUserData));
        console.log('EditUserForm: Updated localStorage with new user data for header refresh');
        
        // Dispatch a storage event to notify the SimpleHeader component
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'authUser',
          newValue: JSON.stringify(updatedUserData),
          storageArea: localStorage
        }));
      }
      
      if (allChangesApplied) {
        setSuccess('User updated successfully.');
      } else {
        setSuccess('User updated with some issues: ' + changeResults.join('; '));
      }
      
      // Delay the fetch to ensure database updates have been committed
      setTimeout(() => {
        // Refresh user data to confirm changes were saved
        fetchUserDetails();
      }, 500);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to update user. Please try again.');
      console.error('Error updating user:', err);
      console.error('Error details:', err.response?.data);
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

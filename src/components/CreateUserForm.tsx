// src/components/CreateUserForm.tsx
import React, { useState } from 'react';
import apiService from '../services/api';

// Define roles - adjust as needed based on backend
type UserRole = 'user' | 'physician' | 'admin';

interface CreateUserFormProps {
  accountId?: string; // Passed from the Astro page
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ accountId }) => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    console.log('Submitting new user:', { accountId, firstName, lastName, userEmail, userRole });

    try {
      const response = await apiService.createUser({
        email: userEmail,
        first_name: firstName,
        last_name: lastName,
        role: userRole,
        phone: phoneNumber
      });

      // Assuming API returns success message or relevant data
      setSuccess(`User "${firstName} ${lastName}" (${userRole}) created successfully.`);
      setFirstName('');
      setLastName('');
      setUserEmail('');
      setPhoneNumber('');
      setUserRole('user'); // Reset role
    } catch (err: any) {
      console.error('Error creating user:', err);
      // Use error message from API response if available
      setError(err.response?.data?.detail || err.message || 'Failed to create user. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-700">Create New User</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="First Name"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Last Name"
          />
        </div>
        <div>
          <label htmlFor="userEmail" className="block text-sm font-medium text-gray-600 mb-1">Email</label>
          <input
            type="email"
            id="userEmail"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="User Email"
          />
        </div>
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Phone Number"
          />
        </div>
        <div>
          <label htmlFor="userRole" className="block text-sm font-medium text-gray-600 mb-1">Role</label>
          <select
            id="userRole"
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as UserRole)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            aria-label="User Role"
          >
            <option value="user">Regular User</option>
            <option value="physician">Physician</option>
            <option value="admin">Admin</option>
          </select>
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
            {submitting ? 'Creating User...' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserForm;

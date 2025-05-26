// src/components/CreateUserForm.tsx
import React, { useState } from 'react';
import apiService from '../services/api';

// Define roles - adjust as needed based on backend
type UserRole = 'patient' | 'clinician' | 'admin' | 'super_admin' | 'lab_tech';

interface CreateUserFormProps {
  accountId?: string; // Passed from the Astro page
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ accountId }) => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole>('clinician');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setSubmitting(false);
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setSubmitting(false);
      return;
    }

    console.log('Submitting new user:', { accountId, firstName, lastName, userEmail, userRole });

    try {
      const response = await apiService.createUser({
        email: userEmail,
        name: `${firstName} ${lastName}`, // Combine first and last name as expected by backend
        role: userRole,
        password: password,
        confirm_password: confirmPassword, // This is required by the backend schema
        account_id: accountId,
        is_active: true
      });

      setSuccess(`User "${firstName} ${lastName}" (${userRole}) created successfully.`);
      setFirstName('');
      setLastName('');
      setUserEmail('');
      setPhoneNumber('');
      setPassword('');
      setConfirmPassword('');
      setUserRole('clinician'); // Reset role
    } catch (err: any) {
      console.error('Error creating user:', err);
      let errorMessage = 'Failed to create user. Please try again.'; // Default message
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail) && detail.length > 0) {
          // Standard FastAPI: list of error objects
          errorMessage = detail.map((e: any) => {
            const field = e.loc && e.loc.length > 1 ? e.loc[e.loc.length - 1] : (e.loc && e.loc.length > 0 ? e.loc[0] : 'input');
            return `${field}: ${e.msg}`;
          }).join('; ');
        } else if (typeof detail === 'string') {
          // Detail is a simple string
          errorMessage = detail;
        } else if (typeof detail === 'object' && detail !== null && typeof detail.msg === 'string') {
          // Detail is a single error object (like the one React complained about)
          const fieldLoc = detail.loc && Array.isArray(detail.loc) ? detail.loc : ['input'];
          const field = fieldLoc.length > 1 ? fieldLoc[fieldLoc.length - 1] : fieldLoc[0];
          errorMessage = `${field}: ${detail.msg}`;
        } else if (typeof detail === 'object' && detail !== null) {
            // Fallback for other object structures
            errorMessage = JSON.stringify(detail);
        } // If detail was something else, it would use the default or err.message
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-700">Create New User</h2>

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
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="userEmail" className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
          <input
            type="email"
            id="userEmail"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="userRole" className="block text-sm font-medium text-gray-600 mb-1">Role</label>
          <select
            id="userRole"
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as UserRole)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="patient">Patient</option>
            <option value="clinician">Clinician</option>
            <option value="admin">Admin</option>
            <option value="lab_tech">Lab Technician</option>
          </select>
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-600 mb-1">Phone Number (Optional)</label>
          <input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
            minLength={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600 mb-1">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {submitting ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>
  );
};

export default CreateUserForm;

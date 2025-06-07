// src/components/GenerateInviteForm.tsx
import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

interface GenerateInviteFormProps {
  providerId?: string; // Optional, might be derived from auth context
  patientId?: string; // Optional, might be passed from dashboard
  patientName?: string; // Optional, might be passed from dashboard
}

const GenerateInviteForm: React.FC<GenerateInviteFormProps> = ({ 
  providerId,
  patientId,
  patientName
}) => {
  // If patientName is provided, try to split it into first and last name
  const nameParts = patientName ? patientName.split(' ') : ['', ''];
  const initialFirstName = nameParts[0] || '';
  const initialLastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  
  const [firstName, setFirstName] = useState<string>(initialFirstName);
  const [lastName, setLastName] = useState<string>(initialLastName);
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  useEffect(() => {
    // Get current user for provider_id if not explicitly provided
    const initializeUser = async () => {
      try {
        const authResult = await apiService.verifyAuth();
        if (authResult.authenticated && authResult.user) {
          setCurrentUser(authResult.user);
          console.log('GenerateInvite: Current user:', authResult.user);
        }
      } catch (err) {
        console.error('GenerateInvite: Error getting current user:', err);
      }
    };

    if (!providerId) {
      initializeUser();
    }
  }, [providerId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setInviteUrl(null);

    try {
      // Use provided providerId, or current user's ID, or throw error if neither available
      let actualProviderId = providerId;
      
      if (!actualProviderId && currentUser?.id) {
        actualProviderId = currentUser.id;
        console.log('GenerateInvite: Using current user ID as provider:', actualProviderId);
      }
      
      if (!actualProviderId) {
        throw new Error('Unable to determine provider ID. Please ensure you are logged in.');
      }

      console.log('GenerateInvite: Submitting with provider_id:', actualProviderId);
      
      const response = await apiService.generateInvite({
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        provider_id: actualProviderId
      });

      setInviteUrl(response.invite_url);
      
      // Reset form fields
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
    } catch (err: any) {
      console.error('Error generating invite:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to generate invite. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-700">Generate Patient Invite</h2>
      
      {inviteUrl ? (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-lg font-medium text-green-800 mb-2">Invite Generated!</h3>
          <p className="text-sm text-green-700 mb-3">Share this link with the patient:</p>
          <div className="p-2 bg-white border border-gray-300 rounded flex items-center mb-3">
            <input 
              type="text" 
              value={inviteUrl} 
              readOnly
              className="flex-1 outline-none text-sm"
            />
            <button 
              onClick={() => {navigator.clipboard.writeText(inviteUrl)}}
              className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            >
              Copy
            </button>
          </div>
          <button
            onClick={() => setInviteUrl(null)}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate Another Invite
          </button>
        </div>
      ) : (
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
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {error && <p className="text-sm text-red-600">{error}</p>}
          
          <div>
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
            >
              {submitting ? 'Generating...' : 'Generate Invite'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default GenerateInviteForm;

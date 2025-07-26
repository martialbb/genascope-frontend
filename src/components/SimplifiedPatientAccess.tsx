// src/components/SimplifiedPatientAccess.tsx
import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

interface SimplifiedPatientAccessProps {
  inviteToken: string;
}

interface InviteVerificationResponse {
  valid: boolean;
  error_message?: string;
  invite_id?: string;
  patient_name?: string;
  provider_name?: string;
  expires_at?: string;
}

const SimplifiedPatientAccess: React.FC<SimplifiedPatientAccessProps> = ({ inviteToken }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [inviteData, setInviteData] = useState<InviteVerificationResponse | null>(null);
  
  // Verify the invite token on component mount
  useEffect(() => {
    const verifyInvite = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiService.verifyInvite(inviteToken);
        setInviteData(response);
        
        if (!response.valid) {
          setError(response.error_message || 'Invalid or expired invitation.');
        }
      } catch (err: any) {
        console.error('Error verifying invite:', err);
        setError('Failed to verify invitation. Please try again or contact support.');
      } finally {
        setLoading(false);
      }
    };
    
    if (inviteToken) {
      verifyInvite();
    } else {
      setError('No invitation token provided.');
      setLoading(false);
    }
  }, [inviteToken]);
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Basic validation
    if (!firstName.trim()) {
      setError('Please enter your first name.');
      return;
    }
    
    if (!lastName.trim()) {
      setError('Please enter your last name.');
      return;
    }
    
    if (!dateOfBirth) {
      setError('Please enter your date of birth.');
      return;
    }
    
    if (!agreeToTerms) {
      setError('You must agree to the Terms of Service.');
      return;
    }
    
    if (!agreeToPrivacy) {
      setError('You must agree to the Privacy Policy.');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Call the new simplified access endpoint
      const response = await apiService.simplifiedAccess({
        invite_token: inviteToken,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        date_of_birth: dateOfBirth,
        agree_to_terms: agreeToTerms,
        agree_to_privacy: agreeToPrivacy
      });
      
      // Store the JWT token
      localStorage.setItem('authToken', response.access_token);
      
      setSuccess(true);
      
      // Redirect to chat interface
      setTimeout(() => {
        window.location.href = '/chat';
      }, 2000);
    } catch (err: any) {
      console.error('Error with simplified access:', err);
      setError(err.response?.data?.detail || err.message || 'Authentication failed. Please check your information and try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Verifying invitation...</p>
      </div>
    );
  }
  
  if (error && !inviteData?.valid) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 className="text-lg font-medium text-center mt-2">Invitation Error</h3>
        </div>
        <p className="text-gray-700 text-center mb-6">{error}</p>
        <div className="text-center">
          <a href="/" className="text-blue-600 hover:text-blue-800">
            Return to homepage
          </a>
        </div>
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="text-green-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <h3 className="text-lg font-medium text-center mt-2">Access Granted!</h3>
        </div>
        <p className="text-gray-700 text-center mb-2">You have been successfully authenticated.</p>
        <p className="text-gray-600 text-center text-sm mb-6">You will be redirected to the chat interface in a moment.</p>
        <div className="text-center">
          <a href="/chat" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
            Start Chat Assessment
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-center text-gray-700">Access Your Health Assessment</h2>
        <p className="text-sm text-gray-600 text-center mt-2">
          Invited by: {inviteData?.provider_name}
        </p>
        <p className="text-sm text-blue-600 text-center mt-2">
          Quick access - no account creation required
        </p>
        {inviteData?.expires_at && (
          <p className="text-xs text-gray-500 text-center mt-1">
            This invitation expires on {new Date(inviteData.expires_at).toLocaleDateString()}
          </p>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            placeholder="Enter your first name"
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
            placeholder="Enter your last name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-600 mb-1">Date of Birth</label>
          <input
            type="date"
            id="dateOfBirth"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="agreeToTerms"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-600">
              I agree to the <a href="/terms" target="_blank" className="text-blue-600 hover:text-blue-800">Terms of Service</a>
            </label>
          </div>
          
          <div className="flex items-start">
            <input
              type="checkbox"
              id="agreeToPrivacy"
              checked={agreeToPrivacy}
              onChange={(e) => setAgreeToPrivacy(e.target.checked)}
              className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="agreeToPrivacy" className="ml-2 block text-sm text-gray-600">
              I agree to the <a href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-800">Privacy Policy</a>
            </label>
          </div>
        </div>
        
        {error && <p className="text-sm text-red-600">{error}</p>}
        
        <div>
          <button
            type="submit"
            disabled={submitting || !agreeToTerms || !agreeToPrivacy}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              submitting || !agreeToTerms || !agreeToPrivacy ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
          >
            {submitting ? 'Verifying...' : 'Start Health Assessment'}
          </button>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            This creates a secure 4-hour session for your assessment.
          </p>
        </div>
      </form>
    </div>
  );
};

export default SimplifiedPatientAccess;

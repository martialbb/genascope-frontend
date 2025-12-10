import React from 'react';
import { useParams } from 'react-router-dom';
import SimplifiedPatientAccess from '../components/SimplifiedPatientAccess';

const PatientInvitePage: React.FC = () => {
  const { inviteId } = useParams<{ inviteId: string }>();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {inviteId ? (
        <SimplifiedPatientAccess inviteToken={inviteId} />
      ) : (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="text-lg font-medium text-center mt-2">Invalid Invitation</h3>
          </div>
          <p className="text-gray-700 text-center mb-6">No invitation code was provided in the URL.</p>
          <div className="text-center">
            <a href="/" className="text-blue-600 hover:text-blue-800">
              Return to homepage
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientInvitePage;

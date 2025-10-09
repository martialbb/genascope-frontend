import React from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import CreateAccountForm from '../components/CreateAccountForm';

const CreateAccountPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/accounts')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Accounts List
          </button>
        </div>
        <CreateAccountForm />
      </div>
    </SidebarLayout>
  );
};

export default CreateAccountPage;

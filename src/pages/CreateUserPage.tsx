import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import CreateUserForm from '../components/CreateUserForm';

const CreateUserPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const accountId = searchParams.get('accountId') || undefined;
  const navigate = useNavigate();

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/users')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Users List
          </button>
        </div>
        <CreateUserForm accountId={accountId} />
      </div>
    </SidebarLayout>
  );
};

export default CreateUserPage;

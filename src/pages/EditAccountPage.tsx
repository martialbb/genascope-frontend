import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import EditAccountForm from '../components/EditAccountForm';

const EditAccountPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    navigate('/admin/accounts');
    return null;
  }

  return (
    <SidebarLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Account</h1>
        <EditAccountForm accountId={id} />
      </div>
    </SidebarLayout>
  );
};

export default EditAccountPage;

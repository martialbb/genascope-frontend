import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import EditUserForm from '../components/EditUserForm';

const EditUserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    navigate('/admin/users');
    return null;
  }

  return (
    <SidebarLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Edit User</h1>
        <EditUserForm userId={id} />
      </div>
    </SidebarLayout>
  );
};

export default EditUserPage;

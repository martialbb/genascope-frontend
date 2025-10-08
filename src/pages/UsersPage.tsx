import React from 'react';
import SidebarLayout from '../components/SidebarLayout';
import UsersList from '../components/UsersList';

export const UsersPage: React.FC = () => {
  return (
    <SidebarLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Users</h1>
        <UsersList />
      </div>
    </SidebarLayout>
  );
};

export default UsersPage;

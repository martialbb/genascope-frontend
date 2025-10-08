import React from 'react';
import SidebarLayout from '../components/SidebarLayout';
import AccountsList from '../components/AccountsList';

export const AccountsPage: React.FC = () => {
  return (
    <SidebarLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Accounts</h1>
        <AccountsList />
      </div>
    </SidebarLayout>
  );
};

export default AccountsPage;

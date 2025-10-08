import React from 'react';
import SidebarLayout from '../components/SidebarLayout';
import InviteDashboard from '../components/InviteDashboard';

export const InvitesPage: React.FC = () => {
  return (
    <SidebarLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Invites</h1>
        <InviteDashboard />
      </div>
    </SidebarLayout>
  );
};

export default InvitesPage;

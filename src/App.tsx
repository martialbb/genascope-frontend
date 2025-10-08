import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import './styles/global.css';

// Import pages
import SidebarLayout from './components/SidebarLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';

// Theme configuration
const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
  },
};

// Placeholder component for pages not yet implemented
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => {
  return (
    <SidebarLayout>
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
          <p className="text-gray-600">This page is under construction.</p>
        </div>
      </div>
    </SidebarLayout>
  );
};

function App() {
  return (
    <ConfigProvider theme={theme}>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Patient Management */}
          <Route path="/patients" element={<PlaceholderPage title="Patients" />} />
          <Route path="/invite" element={<PlaceholderPage title="Invite Patient" />} />
          <Route path="/manage-invites" element={<PlaceholderPage title="Manage Invites" />} />
          
          {/* Appointments */}
          <Route path="/appointments-dashboard" element={<PlaceholderPage title="Appointments Dashboard" />} />
          <Route path="/schedule-appointment" element={<PlaceholderPage title="Schedule Appointment" />} />
          <Route path="/manage-availability" element={<PlaceholderPage title="Manage Availability" />} />
          
          {/* Lab Orders */}
          <Route path="/lab-order" element={<PlaceholderPage title="Order Test" />} />
          
          {/* Configuration */}
          <Route path="/chat-configuration" element={<PlaceholderPage title="Chat Configuration" />} />
          
          {/* Admin Routes */}
          <Route path="/admin/users" element={<PlaceholderPage title="Manage Users" />} />
          <Route path="/admin/accounts" element={<PlaceholderPage title="Manage Accounts" />} />
          <Route path="/admin/create-account" element={<PlaceholderPage title="Create Account" />} />
          <Route path="/admin/edit-user/:id" element={<PlaceholderPage title="Edit User" />} />
          <Route path="/admin/edit-account/:id" element={<PlaceholderPage title="Edit Account" />} />
          
          {/* Default route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </ConfigProvider>
  );
}

export default App;

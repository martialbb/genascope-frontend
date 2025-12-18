import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import './styles/global.css';

// Import pages
import SidebarLayout from './components/SidebarLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { PatientsPage } from './pages/PatientsPage';
import { InvitesPage } from './pages/InvitesPage';
import { ChatConfigurationPage } from './pages/ChatConfigurationPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { UsersPage } from './pages/UsersPage';
import { AccountsPage } from './pages/AccountsPage';
import EditUserPage from './pages/EditUserPage';
import EditAccountPage from './pages/EditAccountPage';
import CreateUserPage from './pages/CreateUserPage';
import CreateAccountPage from './pages/CreateAccountPage';
import PatientInvitePage from './pages/PatientInvitePage';
import ChatSessionPage from './pages/ChatSessionPage';
import SessionDetailPage from './pages/SessionDetailPage';

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
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/invite" element={<PatientsPage />} /> {/* Invite from patients page */}
          <Route path="/invite/:inviteId" element={<PatientInvitePage />} /> {/* Patient invite landing page */}
          <Route path="/manage-invites" element={<InvitesPage />} />

          {/* AI Chat Sessions */}
          <Route path="/ai-chat/sessions" element={<ChatSessionPage />} />
          <Route path="/ai-chat/sessions/:sessionId" element={<SessionDetailPage />} />
          
          {/* Appointments */}
          <Route path="/appointments-dashboard" element={<AppointmentsPage />} />
          <Route path="/schedule-appointment" element={<PlaceholderPage title="Schedule Appointment" />} />
          <Route path="/manage-availability" element={<PlaceholderPage title="Manage Availability" />} />
          
          {/* Lab Orders */}
          <Route path="/lab-order" element={<PlaceholderPage title="Order Test" />} />
          
          {/* Configuration */}
          <Route path="/chat-configuration" element={<ChatConfigurationPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/accounts" element={<AccountsPage />} />
          <Route path="/admin/create-user" element={<CreateUserPage />} />
          <Route path="/admin/create-account" element={<CreateAccountPage />} />
          <Route path="/admin/edit-user/:id" element={<EditUserPage />} />
          <Route path="/admin/edit-account/:id" element={<EditAccountPage />} />
          
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

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
import LandingPage from './pages/LandingPage';

// Import route guards
import ProtectedRoute from './components/ProtectedRoute';
import SimplifiedAccessGuard from './components/SimplifiedAccessGuard';

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
          {/* Public routes - no authentication required */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/invite/:inviteId" element={<PatientInvitePage />} /> {/* Patient invite landing page */}

          {/* AI Chat Sessions - accessible to both regular users and simplified access patients */}
          <Route path="/ai-chat/sessions" element={
            <SimplifiedAccessGuard>
              <ChatSessionPage />
            </SimplifiedAccessGuard>
          } />
          <Route path="/ai-chat/sessions/:sessionId" element={
            <SimplifiedAccessGuard>
              <SessionDetailPage />
            </SimplifiedAccessGuard>
          } />

          {/* Protected routes - NOT accessible to simplified access patients */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />

          {/* Patient Management - requires clinician/admin roles */}
          <Route path="/patients" element={
            <ProtectedRoute allowedRoles={['admin', 'clinician', 'physician', 'super_admin']}>
              <PatientsPage />
            </ProtectedRoute>
          } />
          <Route path="/invite" element={
            <ProtectedRoute allowedRoles={['admin', 'clinician', 'physician', 'super_admin']}>
              <PatientsPage />
            </ProtectedRoute>
          } />
          <Route path="/manage-invites" element={
            <ProtectedRoute allowedRoles={['admin', 'clinician', 'physician', 'super_admin']}>
              <InvitesPage />
            </ProtectedRoute>
          } />
          
          {/* Appointments */}
          <Route path="/appointments-dashboard" element={
            <ProtectedRoute>
              <AppointmentsPage />
            </ProtectedRoute>
          } />
          <Route path="/schedule-appointment" element={
            <ProtectedRoute>
              <PlaceholderPage title="Schedule Appointment" />
            </ProtectedRoute>
          } />
          <Route path="/manage-availability" element={
            <ProtectedRoute allowedRoles={['clinician', 'physician', 'admin', 'super_admin']}>
              <PlaceholderPage title="Manage Availability" />
            </ProtectedRoute>
          } />
          
          {/* Lab Orders */}
          <Route path="/lab-order" element={
            <ProtectedRoute allowedRoles={['admin', 'clinician', 'physician', 'super_admin']}>
              <PlaceholderPage title="Order Test" />
            </ProtectedRoute>
          } />
          
          {/* Configuration - requires admin roles */}
          <Route path="/chat-configuration" element={
            <ProtectedRoute allowedRoles={['admin', 'clinician', 'physician', 'super_admin']}>
              <ChatConfigurationPage />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <UsersPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/accounts" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AccountsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/create-user" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <CreateUserPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/create-account" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <CreateAccountPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/edit-user/:id" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <EditUserPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/edit-account/:id" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <EditAccountPage />
            </ProtectedRoute>
          } />
          
          {/* Landing page for unauthenticated visitors */}
          <Route path="/" element={<LandingPage />} />

          {/* Catch all - redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ConfigProvider>
  );
}

export default App;

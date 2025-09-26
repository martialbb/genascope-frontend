import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'

// Import existing page components (we'll create these in the next steps)
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { PatientsPage } from './pages/PatientsPage'
import { UsersPage } from './pages/UsersPage'
import { InvitesPage } from './pages/InvitesPage'
import { ChatConfigurationPage } from './pages/ChatConfigurationPage'
import { AppointmentsPage } from './pages/AppointmentsPage'
import { AccountsPage } from './pages/AccountsPage'

// Import Ant Design styles
import 'antd/dist/reset.css'

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/patients" element={
            <ProtectedRoute>
              <PatientsPage />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          } />
          <Route path="/invites" element={
            <ProtectedRoute>
              <InvitesPage />
            </ProtectedRoute>
          } />
          <Route path="/chat-configuration" element={
            <ProtectedRoute>
              <ChatConfigurationPage />
            </ProtectedRoute>
          } />
          <Route path="/appointments" element={
            <ProtectedRoute>
              <AppointmentsPage />
            </ProtectedRoute>
          } />
          <Route path="/accounts" element={
            <ProtectedRoute>
              <AccountsPage />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </ConfigProvider>
  )
}

export default App

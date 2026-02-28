import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import DashboardTable from '../components/DashboardTable';
import AppointmentsList from '../components/AppointmentsList';
import InviteStatsWidget from '../components/InviteStatsWidget';

interface UserData {
  id: string;
  email: string;
  role: string;
  name?: string;
  account_id?: string;
}

export const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Protect dashboard - redirect to login if not authenticated
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('authUser');
    
    if (!token || !userData) {
      navigate('/login');
    } else {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        navigate('/login');
      }
    }
  }, [navigate]);

  // Show invite stats widget for admins and clinicians
  const showInviteStats = user && (user.role === 'admin' || user.role === 'clinician' || user.role === 'physician');

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <SidebarLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Dashboard</h1>
        
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Today's Appointments</h2>
            <Link 
              to="/appointments-dashboard" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View All Appointments
            </Link>
          </div>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <AppointmentsList
              clinicianId={user?.id || ''}
              isClinicianView={true}
            />
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Patient Management</h2>
          <DashboardTable />
        </div>
        
        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Manage Your Availability</h3>
            <p className="text-gray-600 mb-4">Set your availability to allow patients to book appointments with you.</p>
            <Link 
              to="/manage-availability" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Set Availability
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Invite a New Patient</h3>
            <p className="text-gray-600 mb-4">Send an invitation to a new patient to join the platform.</p>
            <Link 
              to="/invite" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Invite Patient
            </Link>
          </div>

          {/* Invite Statistics Widget - Only show for admins and clinicians */}
          {showInviteStats && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <InviteStatsWidget />
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
};

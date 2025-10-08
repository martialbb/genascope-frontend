import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import AppointmentDashboard from '../components/AppointmentDashboard';

interface UserData {
  id: string;
  email: string;
  role: 'clinician' | 'patient' | 'admin';
  name?: string;
}

export const AppointmentsPage: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('authUser');
    
    if (!token || !userData) {
      navigate('/login');
    } else {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data');
        navigate('/login');
      }
    }
  }, [navigate]);

  if (!user) {
    return null;
  }

  return (
    <SidebarLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Appointments</h1>
        <AppointmentDashboard 
          userRole={user.role}
          userId={user.id}
        />
      </div>
    </SidebarLayout>
  );
};

export default AppointmentsPage;

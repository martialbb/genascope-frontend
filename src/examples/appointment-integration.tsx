// Example integration of the enhanced appointment system
import React from 'react';
import { ConfigProvider } from 'antd';
import AppointmentDashboard from '../components/AppointmentDashboard';
import EnhancedAppointmentManager from '../components/EnhancedAppointmentManager';
import SchedulingComponent from '../components/SchedulingComponent';

// Example for a clinician dashboard page
export const ClinicianAppointmentPage: React.FC = () => {
  const clinicianId = "clinician-123"; // This would come from auth context
  
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#1890ff' } }}>
      <AppointmentDashboard 
        userRole="clinician"
        userId={clinicianId}
        clinicianId={clinicianId}
      />
    </ConfigProvider>
  );
};

// Example for a patient dashboard page
export const PatientAppointmentPage: React.FC = () => {
  const patientId = "patient-456"; // This would come from auth context
  
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#1890ff' } }}>
      <AppointmentDashboard 
        userRole="patient"
        userId={patientId}
        patientId={patientId}
      />
    </ConfigProvider>
  );
};

// Example for standalone appointment scheduling
export const StandaloneScheduling: React.FC = () => {
  const patientId = "patient-456";
  const clinicianId = "clinician-123";
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Book an Appointment</h1>
      <SchedulingComponent 
        patientId={patientId}
        clinicianId={clinicianId}
        afterBooking={(appointmentId) => {
          console.log('Appointment booked:', appointmentId);
          // Redirect or show success message
        }}
      />
    </div>
  );
};

// Example for admin appointment management
export const AdminAppointmentManagement: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Appointment Management</h1>
      <EnhancedAppointmentManager 
        userRole="admin"
      />
    </div>
  );
};

// Integration with authentication context
interface AppointmentPageProps {
  user: {
    id: string;
    role: 'clinician' | 'patient' | 'admin';
    clinician_id?: string;
    patient_id?: string;
  };
}

export const AuthenticatedAppointmentPage: React.FC<AppointmentPageProps> = ({ user }) => {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#1890ff' } }}>
      <AppointmentDashboard 
        userRole={user.role}
        userId={user.id}
        clinicianId={user.clinician_id}
        patientId={user.patient_id}
      />
    </ConfigProvider>
  );
};

export default {
  ClinicianAppointmentPage,
  PatientAppointmentPage,
  StandaloneScheduling,
  AdminAppointmentManagement,
  AuthenticatedAppointmentPage
};

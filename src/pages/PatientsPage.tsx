import React from 'react';
import SidebarLayout from '../components/SidebarLayout';
import PatientManager from '../components/PatientManager';

export const PatientsPage: React.FC = () => {
  return (
    <SidebarLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Patients Management</h1>
        <PatientManager />
      </div>
    </SidebarLayout>
  );
};

export default PatientsPage;

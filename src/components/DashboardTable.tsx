// src/components/DashboardTable.tsx
import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import type { Patient as BackendPatient, PatientStatus } from '../types/patients';

// Define the structure for dashboard patient display
interface DashboardPatient {
  id: string;
  name: string;
  email: string;
  status: 'Pending Invite' | 'Active' | 'Inactive' | 'Archived' | 'Pending';
  lastActivity: string; // Could be a date string
  clinician_name?: string;
  has_pending_invite: boolean;
}

const DashboardTable: React.FC = () => {
  const [patients, setPatients] = useState<DashboardPatient[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Convert backend PatientStatus to dashboard display format
  const getDisplayStatus = (backendPatient: BackendPatient): DashboardPatient['status'] => {
    if (backendPatient.has_pending_invite) {
      return 'Pending Invite';
    }
    
    switch (backendPatient.status) {
      case PatientStatus.ACTIVE:
        return 'Active';
      case PatientStatus.INACTIVE:
        return 'Inactive';
      case PatientStatus.ARCHIVED:
        return 'Archived';
      case PatientStatus.PENDING:
        return 'Pending';
      default:
        return 'Pending';
    }
  };

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Fetching patients from API...');
      const backendPatients = await apiService.getPatients({ limit: 10 });
      
      // Transform backend data to dashboard format
      const dashboardPatients: DashboardPatient[] = backendPatients.map(patient => ({
        id: patient.id,
        name: `${patient.first_name} ${patient.last_name}`,
        email: patient.email,
        status: getDisplayStatus(patient),
        lastActivity: new Date(patient.updated_at).toLocaleDateString(),
        clinician_name: patient.clinician_name,
        has_pending_invite: patient.has_pending_invite
      }));
      
      console.log(`✅ Successfully loaded ${dashboardPatients.length} patients`);
      setPatients(dashboardPatients);
    } catch (err) {
      console.error("❌ Error fetching patients:", err);
      setError('Failed to load patient data. Please ensure the backend service is running and accessible.');
      setPatients([]); // Clear patients on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Filter logic (simple text search on name or status)
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(filter.toLowerCase()) ||
    patient.status.toLowerCase().includes(filter.toLowerCase())
  );

  const handleOrderTest = async (patientId: string) => {
    console.log(`Ordering test for patient ${patientId}`);
    
    // Navigate to the lab order page with patient ID
    window.location.href = `/lab-order?patientId=${patientId}`;
  };

  const handleViewResults = (patientId: string) => {
    console.log(`Viewing results for patient ${patientId}`);
    // Placeholder: Add navigation or modal logic here
    alert(`Results for patient ${patientId} will be displayed here.`);
  };

  const handleInvite = (patientId: string, patientName: string) => {
    console.log(`Sending invite to patient ${patientName}`);
    // Navigate to invite page
    window.location.href = `/invite?patientId=${patientId}&patientName=${encodeURIComponent(patientName)}`;
  };

  if (loading) {
    return <div className="text-center p-4">Loading patient data...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <input
          type="text"
          placeholder="Filter by name or status..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 rounded-md w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Filter patients"
        />
        <button 
          onClick={fetchPatients} 
          className="ml-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Refresh
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div>
                      <div className="font-medium text-gray-900">{patient.name}</div>
                      <div className="text-sm text-gray-500">{patient.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      patient.status === 'Active' ? 'bg-green-100 text-green-800' :
                      patient.status === 'Pending Invite' ? 'bg-yellow-100 text-yellow-800' :
                      patient.status === 'Inactive' ? 'bg-gray-100 text-gray-800' :
                      patient.status === 'Archived' ? 'bg-red-100 text-red-800' :
                      patient.status === 'Pending' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800' // Default
                    }`}>
                      {patient.status}
                    </span>
                    {patient.clinician_name && (
                      <div className="text-xs text-gray-400 mt-1">
                        Clinician: {patient.clinician_name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.lastActivity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="space-x-2">
                      {patient.has_pending_invite && (
                        <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                          Invite Sent
                        </span>
                      )}
                      {!patient.has_pending_invite && (patient.status === 'Pending' || patient.status === 'Inactive') && (
                        <button
                          onClick={() => handleInvite(patient.id, patient.name)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150"
                        >
                          Send Invite
                        </button>
                      )}
                      <button
                        onClick={() => window.location.href = `/patients`}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-150"
                      >
                        Manage
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  {filter ? 'No patients found matching filter.' : 'No patient data available.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardTable;

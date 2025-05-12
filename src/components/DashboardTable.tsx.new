// src/components/DashboardTable.tsx
import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

// Define the structure for patient data
interface Patient {
  id: string;
  name: string;
  status: 'Pending Invite' | 'Chat In Progress' | 'Chat Completed' | 'Test Ordered' | 'Results Ready';
  lastActivity: string; // Could be a date string
}

const DashboardTable: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock data for now - we'll need to add a getPatients method to apiService
      // const response = await apiService.getPatients(); 
      
      // For now using mock data
      const mockPatients: Patient[] = [
        { id: 'p001', name: 'Alice Johnson', status: 'Chat Completed', lastActivity: '2025-05-11' },
        { id: 'p002', name: 'Bob Smith', status: 'Chat In Progress', lastActivity: '2025-05-12' },
        { id: 'p003', name: 'Carol Wilson', status: 'Results Ready', lastActivity: '2025-05-10' },
        { id: 'p004', name: 'David Brown', status: 'Test Ordered', lastActivity: '2025-05-09' },
        { id: 'p005', name: 'Eva Martinez', status: 'Pending Invite', lastActivity: '2025-05-08' },
      ];
      
      setPatients(mockPatients);
    } catch (err) {
      console.error("Error fetching patients:", err);
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      patient.status === 'Chat Completed' ? 'bg-green-100 text-green-800' :
                      patient.status === 'Results Ready' ? 'bg-blue-100 text-blue-800' :
                      patient.status === 'Test Ordered' ? 'bg-yellow-100 text-yellow-800' :
                      patient.status === 'Chat In Progress' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800' // Pending Invite or others
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.lastActivity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="space-x-2">
                      {patient.status === 'Pending Invite' && (
                        <button
                          onClick={() => handleInvite(patient.id, patient.name)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150"
                        >
                          Send Invite
                        </button>
                      )}
                      {patient.status === 'Chat Completed' && (
                        <button
                          onClick={() => handleOrderTest(patient.id)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150"
                        >
                          Order Test
                        </button>
                      )}
                      {patient.status === 'Results Ready' && (
                        <button
                          onClick={() => handleViewResults(patient.id)}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-150"
                        >
                          View Results
                        </button>
                      )}
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

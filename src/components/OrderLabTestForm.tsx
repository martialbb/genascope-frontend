// src/components/OrderLabTestForm.tsx
import React, { useState } from 'react';
import apiService from '../services/api';

interface OrderLabTestFormProps {
  providerId?: string; // Optional, might be derived from auth context
  patientId?: string; // Optional, might be passed from dashboard
  patientName?: string; // Optional, might be passed from dashboard
}

interface PatientInfo {
  patientId: string;
  firstName: string;
  lastName: string;
}

// Types of genetic tests available
const TEST_TYPES = [
  { id: 'BRCA', name: 'BRCA Genetic Panel' },
  { id: 'MULTI', name: 'Multi-Gene Cancer Panel' },
  { id: 'LYNCH', name: 'Lynch Syndrome Panel' },
  { id: 'LARGE', name: 'Comprehensive Cancer Risk Panel' },
];

const OrderLabTestForm: React.FC<OrderLabTestFormProps> = ({ 
  providerId = 'default-provider',
  patientId: initialPatientId,
  patientName: initialPatientName
}) => {
  const [patientId, setPatientId] = useState<string>(initialPatientId || '');
  const [testType, setTestType] = useState<string>(TEST_TYPES[0].id);
  const [patientSearch, setPatientSearch] = useState<string>(initialPatientName || '');
  const [addressLine1, setAddressLine1] = useState<string>('');
  const [addressLine2, setAddressLine2] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [zipCode, setZipCode] = useState<string>('');
  
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{orderId: string, message: string} | null>(null);
  
  // Mock patient search functionality
  // In a real app, this would query your backend API
  const searchPatients = (query: string): PatientInfo[] => {
    if (!query || query.length < 3) return [];
    
    // Mock patient data
    const mockPatients = [
      { patientId: 'PAT001', firstName: 'Jane', lastName: 'Doe' },
      { patientId: 'PAT002', firstName: 'John', lastName: 'Smith' },
      { patientId: 'PAT003', firstName: 'Maria', lastName: 'Garcia' },
    ];
    
    return mockPatients.filter(p => 
      p.firstName.toLowerCase().includes(query.toLowerCase()) || 
      p.lastName.toLowerCase().includes(query.toLowerCase()) ||
      p.patientId.toLowerCase().includes(query.toLowerCase())
    );
  };
  
  const patients = searchPatients(patientSearch);
  
  const selectPatient = (patient: PatientInfo) => {
    setPatientId(patient.patientId);
    setPatientSearch(`${patient.firstName} ${patient.lastName} (${patient.patientId})`);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await apiService.orderTest({
        patient_id: patientId,
        test_type: testType,
        provider_id: providerId,
        shipping_address: {
          line1: addressLine1,
          line2: addressLine2,
          city,
          state,
          zip_code: zipCode
        }
      });
      
      setSuccess({
        orderId: response.data.order_id,
        message: `Test order ${response.data.order_id} was successfully placed`
      });
      
      // Reset form
      setPatientId('');
      setPatientSearch('');
      setTestType(TEST_TYPES[0].id);
      setAddressLine1('');
      setAddressLine2('');
      setCity('');
      setState('');
      setZipCode('');
    } catch (err: any) {
      console.error('Error ordering lab test:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to place test order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-700">Order Laboratory Test</h2>
      
      {success ? (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-lg font-medium text-green-800 mb-2">Test Order Submitted!</h3>
          <p className="text-sm text-green-700 mb-3">{success.message}</p>
          <p className="text-sm text-green-700 mb-3">Order ID: <strong>{success.orderId}</strong></p>
          <button
            onClick={() => setSuccess(null)}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Place Another Order
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Patient Information</h3>
            
            <div>
              <label htmlFor="patientSearch" className="block text-sm font-medium text-gray-600 mb-1">
                Search Patient
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="patientSearch"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  placeholder="Search by name or ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                
                {patients.length > 0 && patientSearch.length >= 3 && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border">
                    {patients.map((patient) => (
                      <div 
                        key={patient.patientId}
                        onClick={() => selectPatient(patient)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {patient.firstName} {patient.lastName} ({patient.patientId})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Test Information</h3>
            
            <div>
              <label htmlFor="testType" className="block text-sm font-medium text-gray-600 mb-1">Test Type</label>
              <select
                id="testType"
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {TEST_TYPES.map(test => (
                  <option key={test.id} value={test.id}>{test.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Shipping Information</h3>
            
            <div>
              <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-600 mb-1">Address Line 1</label>
              <input
                type="text"
                id="addressLine1"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-600 mb-1">Address Line 2 (Optional)</label>
              <input
                type="text"
                id="addressLine2"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-600 mb-1">City</label>
                <input
                  type="text"
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-600 mb-1">State</label>
                <input
                  type="text"
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-600 mb-1">Zip Code</label>
              <input
                type="text"
                id="zipCode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {error && <p className="text-sm text-red-600">{error}</p>}
          
          <div>
            <button
              type="submit"
              disabled={submitting || !patientId}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                submitting || !patientId ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
            >
              {submitting ? 'Submitting Order...' : 'Place Test Order'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default OrderLabTestForm;

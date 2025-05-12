// src/tests/unit/components/DashboardTable.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import DashboardTable from '../../../components/DashboardTable';

// Mock axios
vi.mock('axios');

describe('DashboardTable', () => {
  const mockPatients = [
    { id: 'p1', name: 'John Doe', status: 'Chat Completed', lastActivity: '2025-05-10' }, // Changed to Chat Completed for Order Test button
    { id: 'p2', name: 'Jane Smith', status: 'Results Ready', lastActivity: '2025-05-09' },
    { id: 'p3', name: 'Bob Johnson', status: 'Pending Invite', lastActivity: '2025-05-08' },
  ];
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', async () => {
    // Mock API call that never resolves
    vi.mocked(axios.get).mockReturnValueOnce(new Promise(() => {}));
    
    render(<DashboardTable />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays patient data after successful API call', async () => {
    // Mock successful API response
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockPatients } as any);
    
    render(<DashboardTable />);
    
    // Check for loading initially
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });
    
    // Check for status and date columns
    expect(screen.getByText('Chat Completed')).toBeInTheDocument();
    expect(screen.getByText('Results Ready')).toBeInTheDocument();
    expect(screen.getByText('2025-05-10')).toBeInTheDocument();
  });

  it('shows error message when API call fails', async () => {
    // Mock API failure
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('Failed to fetch patients'));
    
    render(<DashboardTable />);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to load patient data/i)).toBeInTheDocument();
    });
  });

  it('filters patients based on search input', async () => {
    // Mock successful API response
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockPatients } as any);
    
    render(<DashboardTable />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Get search input and filter for "Jane"
    const searchInput = screen.getByPlaceholderText(/Filter by name or status/i);
    fireEvent.change(searchInput, { target: { value: 'Jane' } });
    
    // Jane should be visible
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    
    // John and Bob shouldn't be visible
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
  });

  it('filters by status', async () => {
    // Mock successful API response
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockPatients } as any);
    
    render(<DashboardTable />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Results Ready')).toBeInTheDocument();
    });
    
    // Filter by status "Results Ready"
    const searchInput = screen.getByPlaceholderText(/Filter by name or status/i);
    fireEvent.change(searchInput, { target: { value: 'Results Ready' } });
    
    // Only Jane should be visible
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
  });

  it('calls API correctly when ordering a test', async () => {
    // Mock patients API call
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockPatients } as any);
    // Mock successful order test API call
    vi.mocked(axios.post).mockResolvedValueOnce({ data: { success: true } } as any);
    
    render(<DashboardTable />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Find order test button - can search by multiple approaches
    // (This assumes text-based approach, but you could use a test ID or other selector)
    const orderButtons = screen.getAllByRole('button', { name: /order test/i });
    fireEvent.click(orderButtons[0]); // Click on first patient's button
    
    // Verify API call
    expect(axios.post).toHaveBeenCalledWith('/api/order_test', { patientId: 'p1' });
  });

  it('shows refresh button and refreshes data when clicked', async () => {
    // Initial data load
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockPatients } as any);
    
    render(<DashboardTable />);
    
    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Clear mocks to track the refresh
    vi.clearAllMocks();
    
    // Updated data for the refresh
    const updatedPatients = [
      ...mockPatients,
      { id: 'p4', name: 'Sarah Lee', status: 'Chat Completed', lastActivity: '2025-05-11' }
    ];
    
    // Setup mock for refresh call
    vi.mocked(axios.get).mockResolvedValueOnce({ data: updatedPatients } as any);
    
    // Click refresh button
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);
    
    // API should be called again
    expect(axios.get).toHaveBeenCalledWith('/api/patients');
    
    // New patient should appear
    await waitFor(() => {
      expect(screen.getByText('Sarah Lee')).toBeInTheDocument();
    });
  });
});

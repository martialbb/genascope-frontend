// src/tests/unit/components/DashboardTable.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import DashboardTable from '../../../components/DashboardTable';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Sample patient data
const mockPatients = [
  { id: '1', name: 'Alice Smith', status: 'Chat Completed', lastActivity: '2025-04-24' },
  { id: '2', name: 'Bob Johnson', status: 'Results Ready', lastActivity: '2025-04-23' },
  { id: '3', name: 'Charlie Brown', status: 'Pending Invite', lastActivity: '2025-04-25' },
  { id: '4', name: 'Diana Prince', status: 'Test Ordered', lastActivity: '2025-04-22' },
  { id: '5', name: 'Ethan Hunt', status: 'Chat In Progress', lastActivity: '2025-04-25' },
];

describe('DashboardTable Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockedAxios.get.mockReset();
    mockedAxios.post.mockReset();
    // Mock console.log/error to avoid cluttering test output if needed
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore mocks
    vi.restoreAllMocks();
  });

  it('should show loading state initially', () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // Prevent state update warning
    render(<DashboardTable />);
    expect(screen.getByText(/loading patient data.../i)).toBeInTheDocument();
  });

  it('should display patient data after successful fetch', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockPatients });
    render(<DashboardTable />);

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      expect(screen.getByText('Chat Completed')).toBeInTheDocument();
      expect(screen.getByText('Results Ready')).toBeInTheDocument();
    });

    // Check table headers
    expect(screen.getByRole('columnheader', { name: /name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /status/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /last activity/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /actions/i })).toBeInTheDocument();
  });

  it('should display error message on fetch failure', async () => {
    const errorMessage = 'Network Error';
    mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));
    render(<DashboardTable />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load patient data/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/loading patient data.../i)).not.toBeInTheDocument();
  });

  it('should filter patients by name', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockPatients });
    render(<DashboardTable />);

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument(); // Wait for data
    });

    const filterInput = screen.getByLabelText(/filter patients/i);
    fireEvent.change(filterInput, { target: { value: 'Alice' } });

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
    expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
  });

   it('should filter patients by status', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockPatients });
    render(<DashboardTable />);

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument(); // Wait for data
    });

    const filterInput = screen.getByLabelText(/filter patients/i);
    fireEvent.change(filterInput, { target: { value: 'Results Ready' } });

    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
  });

  it('should show "No patients found" message when filter matches nothing', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockPatients });
    render(<DashboardTable />);

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument(); // Wait for data
    });

    const filterInput = screen.getByLabelText(/filter patients/i);
    fireEvent.change(filterInput, { target: { value: 'NonExistent' } });

    expect(screen.getByText(/no patients found matching filter/i)).toBeInTheDocument();
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
  });

   it('should show "No patient data available" message when fetch returns empty', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    render(<DashboardTable />);

    await waitFor(() => {
      expect(screen.getByText(/no patient data available/i)).toBeInTheDocument();
    });
    expect(screen.queryByRole('row', { name: /alice smith/i })).not.toBeInTheDocument();
  });

  it('should render "Order Test" button for "Chat Completed" status', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockPatients });
    render(<DashboardTable />);

    await waitFor(() => {
      // Find the row for Alice Smith
      const aliceRow = screen.getByRole('row', { name: /alice smith/i });
      // Check for the button within that row
      const orderButton = within(aliceRow).getByRole('button', { name: /order test/i });
      expect(orderButton).toBeInTheDocument();
    });
  });

  it('should render "View Results" button for "Results Ready" status', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockPatients });
    render(<DashboardTable />);

    await waitFor(() => {
      const bobRow = screen.getByRole('row', { name: /bob johnson/i });
      const viewButton = within(bobRow).getByRole('button', { name: /view results/i });
      expect(viewButton).toBeInTheDocument();
    });
  });

  it('should call handleOrderTest and API on button click', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockPatients });
    mockedAxios.post.mockResolvedValueOnce({}); // Mock successful post
    render(<DashboardTable />);

    let orderButton: HTMLElement;
    await waitFor(() => {
      const aliceRow = screen.getByRole('row', { name: /alice smith/i });
      orderButton = within(aliceRow).getByRole('button', { name: /order test/i });
      expect(orderButton).toBeInTheDocument();
    });

    fireEvent.click(orderButton!);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/order_test', { patientId: '1' });
      // Check if status updated optimistically
      const aliceRow = screen.getByRole('row', { name: /alice smith/i });
      expect(within(aliceRow).getByText('Test Ordered')).toBeInTheDocument();
    });
  });

   it('should handle error when ordering test fails', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockPatients });
    const postError = new Error('API Error');
    mockedAxios.post.mockRejectedValueOnce(postError);
    // Mock window.alert
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<DashboardTable />);

    let orderButton: HTMLElement;
    await waitFor(() => {
      const aliceRow = screen.getByRole('row', { name: /alice smith/i });
      orderButton = within(aliceRow).getByRole('button', { name: /order test/i });
      expect(orderButton).toBeInTheDocument();
    });

    fireEvent.click(orderButton!);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/order_test', { patientId: '1' });
      // Check if alert was called
      expect(alertMock).toHaveBeenCalledWith('Failed to order test for patient 1. Please try again.');
      // Check if status did NOT change optimistically on error
      const aliceRow = screen.getByRole('row', { name: /alice smith/i });
      expect(within(aliceRow).getByText('Chat Completed')).toBeInTheDocument(); // Should remain the same
    });

    alertMock.mockRestore(); // Clean up alert mock
  });

  // Basic test for View Results click (currently just logs)
  it('should call handleViewResults on button click', async () => {
     const consoleSpy = vi.spyOn(console, 'log');
     mockedAxios.get.mockResolvedValueOnce({ data: mockPatients });
     render(<DashboardTable />);

     let viewButton: HTMLElement;
     await waitFor(() => {
       const bobRow = screen.getByRole('row', { name: /bob johnson/i });
       viewButton = within(bobRow).getByRole('button', { name: /view results/i });
       expect(viewButton).toBeInTheDocument();
     });

     fireEvent.click(viewButton!);

     expect(consoleSpy).toHaveBeenCalledWith('Viewing results for patient 2');
     consoleSpy.mockRestore();
   });

});

// Helper to query within elements (needed for finding buttons in specific rows)
import { within } from '@testing-library/react';

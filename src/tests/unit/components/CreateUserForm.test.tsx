// filepath: /Users/martial-m1/cancer-genix-frontend/src/tests/unit/components/CreateUserForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import CreateUserForm from '../../../components/CreateUserForm';

// Mock axios
vi.mock('axios');

describe('CreateUserForm', () => {
  // Test props
  const accountId = "acc_123456";
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form correctly with account ID', () => {
    render(<CreateUserForm accountId={accountId} />);
    
    // Check for form title and inputs
    expect(screen.getByText(/create new user/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create user/i })).toBeInTheDocument();
  });

  it('handles input changes and role selection', () => {
    render(<CreateUserForm accountId={accountId} />);
    
    // Get form elements
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const roleSelect = screen.getByLabelText(/role/i);
    
    // Simulate user typing and selection
    fireEvent.change(nameInput, { target: { value: 'Dr. Jane Smith' } });
    fireEvent.change(emailInput, { target: { value: 'jane.smith@hospital.com' } });
    fireEvent.change(roleSelect, { target: { value: 'admin' } });
    
    // Check if values are updated
    expect(nameInput).toHaveValue('Dr. Jane Smith');
    expect(emailInput).toHaveValue('jane.smith@hospital.com');
    expect(roleSelect).toHaveValue('admin');
  });

  it('submits the form and shows success message on successful submission', async () => {
    // Mock successful API response
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: { message: 'User "Dr. Jane Smith" (clinician) created successfully.' }
    } as any);
    
    render(<CreateUserForm accountId={accountId} />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Dr. Jane Smith' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane.smith@hospital.com' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create user/i }));
    
    // Check if the API was called with correct data
    expect(axios.post).toHaveBeenCalledWith('/api/account/create_user', {
      accountId: 'acc_123456',
      userName: 'Dr. Jane Smith',
      userEmail: 'jane.smith@hospital.com',
      userRole: 'clinician' // Default role
    });
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText('User "Dr. Jane Smith" (clinician) created successfully.')).toBeInTheDocument();
    });
    
    // Check if form was reset
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toHaveValue('');
      expect(screen.getByLabelText(/email/i)).toHaveValue('');
    });
  });

  it('shows error message when API call fails', async () => {
    // Mock API failure
    vi.mocked(axios.post).mockRejectedValueOnce({
      response: {
        data: {
          detail: 'Email already in use.'
        }
      }
    });
    
    render(<CreateUserForm accountId={accountId} />);
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Dr. Jane Smith' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane.smith@hospital.com' } });
    fireEvent.click(screen.getByRole('button', { name: /create user/i }));
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Email already in use.')).toBeInTheDocument();
    });
  });
  
  it('shows generic error message when API error has no detail', async () => {
    // Mock API failure with network error
    vi.mocked(axios.post).mockRejectedValueOnce(new Error('Network Error'));
    
    render(<CreateUserForm accountId={accountId} />);
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Dr. Jane Smith' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane.smith@hospital.com' } });
    fireEvent.click(screen.getByRole('button', { name: /create user/i }));
    
    // Check for fallback error message
    await waitFor(() => {
      expect(screen.getByText('Network Error')).toBeInTheDocument();
    });
  });

  it('disables form submission while API call is in progress', async () => {
    // Mock a delayed API response
    const mockApiCall = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: { message: 'Success' } });
        }, 100);
      });
    });
    
    vi.mocked(axios.post).mockImplementationOnce(mockApiCall as any);
    
    render(<CreateUserForm accountId={accountId} />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Dr. Jane Smith' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane.smith@hospital.com' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create user/i }));
    
    // Check button is disabled and shows loading state
    expect(screen.getByRole('button', { name: /creating.../i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /creating.../i })).toBeDisabled();
    
    // After API resolves, button should be active again
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create user/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create user/i })).not.toBeDisabled();
    });
  });
});
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import CreateAccountForm from '../../../components/CreateAccountForm';

// Mock axios
vi.mock('axios');

describe('CreateAccountForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form correctly', () => {
    render(<CreateAccountForm />);
    
    // Check for form title and inputs
    expect(screen.getByText('Create New Account')).toBeInTheDocument();
    expect(screen.getByLabelText('Account Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Account Admin Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('handles input changes', () => {
    render(<CreateAccountForm />);
    
    // Get form elements
    const accountNameInput = screen.getByLabelText('Account Name');
    const adminEmailInput = screen.getByLabelText('Account Admin Email');
    
    // Simulate user typing
    fireEvent.change(accountNameInput, { target: { value: 'Test Hospital' } });
    fireEvent.change(adminEmailInput, { target: { value: 'admin@testhospital.com' } });
    
    // Check if values are updated
    expect(accountNameInput).toHaveValue('Test Hospital');
    expect(adminEmailInput).toHaveValue('admin@testhospital.com');
  });

  it('submits the form and shows success message on successful submission', async () => {
    // Mock successful API response
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: { message: 'Account "Test Hospital" created successfully.' }
    } as any);
    
    render(<CreateAccountForm />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText('Account Name'), { target: { value: 'Test Hospital' } });
    fireEvent.change(screen.getByLabelText('Account Admin Email'), { target: { value: 'admin@testhospital.com' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    
    // Check if the API was called with correct data
    expect(axios.post).toHaveBeenCalledWith('/api/admin/create_account', {
      accountName: 'Test Hospital',
      adminEmail: 'admin@testhospital.com'
    });
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText('Account "Test Hospital" created successfully.')).toBeInTheDocument();
    });
    
    // Check if form was reset
    await waitFor(() => {
      expect(screen.getByLabelText('Account Name')).toHaveValue('');
      expect(screen.getByLabelText('Account Admin Email')).toHaveValue('');
    });
  });

  it('shows error message when API call fails', async () => {
    // Mock API failure
    vi.mocked(axios.post).mockRejectedValueOnce({
      response: {
        data: {
          detail: 'Account with this email already exists.'
        }
      }
    });
    
    render(<CreateAccountForm />);
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText('Account Name'), { target: { value: 'Test Hospital' } });
    fireEvent.change(screen.getByLabelText('Account Admin Email'), { target: { value: 'admin@testhospital.com' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Account with this email already exists.')).toBeInTheDocument();
    });
  });
  
  it('shows generic error message when API error has no detail', async () => {
    // Mock API failure with network error
    vi.mocked(axios.post).mockRejectedValueOnce(new Error('Network Error'));
    
    render(<CreateAccountForm />);
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText('Account Name'), { target: { value: 'Test Hospital' } });
    fireEvent.change(screen.getByLabelText('Account Admin Email'), { target: { value: 'admin@testhospital.com' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    
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
    
    render(<CreateAccountForm />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText('Account Name'), { target: { value: 'Test Hospital' } });
    fireEvent.change(screen.getByLabelText('Account Admin Email'), { target: { value: 'admin@testhospital.com' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    
    // Check button is disabled and shows loading state
    expect(screen.getByRole('button', { name: /creating.../i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /creating.../i })).toBeDisabled();
    
    // After API resolves, button should be active again
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).not.toBeDisabled();
    });
  });
});
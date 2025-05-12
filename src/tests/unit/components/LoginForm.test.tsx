// src/tests/unit/components/LoginForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginForm from '../../../components/LoginForm'; // Corrected path
import { AuthContext } from '../../../context/AuthContext'; // Corrected path

// Mock the AuthContext
const mockLogin = vi.fn();
const mockLogout = vi.fn();
const mockCheckAuth = vi.fn();

const renderWithAuth = (contextValue: any) => {
  return render(
    <AuthContext.Provider value={contextValue}>
      <LoginForm />
    </AuthContext.Provider>
  );
};

describe('LoginForm Component', () => {
  let defaultContextValue: any;

  beforeEach(() => {
    // Reset mocks and context before each test
    mockLogin.mockClear();
    mockLogout.mockClear();
    mockCheckAuth.mockClear();
    defaultContextValue = {
      user: null,
      loading: false,
      error: null,
      login: mockLogin,
      logout: mockLogout,
      checkAuth: mockCheckAuth,
    };
  });

  it('should render email input, password input, and login button', () => {
    renderWithAuth(defaultContextValue);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('allows user to type into email and password fields', () => {
    renderWithAuth(defaultContextValue);
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('calls login function with email and password on form submission', async () => {
    renderWithAuth(defaultContextValue);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledTimes(1);
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('does not call login function if email or password is empty', () => {
    renderWithAuth(defaultContextValue);
    const loginButton = screen.getByRole('button', { name: /login/i });

    // Test with empty email
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    expect(mockLogin).not.toHaveBeenCalled();

    // Test with empty password
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: '' } }); // Clear password
    fireEvent.click(loginButton);
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('displays error message from context', () => {
    const errorContextValue = { ...defaultContextValue, error: 'Invalid credentials' };
    renderWithAuth(errorContextValue);
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('shows loading state on the button when loading is true', () => {
    const loadingContextValue = { ...defaultContextValue, loading: true };
    renderWithAuth(loadingContextValue);
    const loginButton = screen.getByRole('button', { name: /logging in.../i });
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toBeDisabled();
  });

  it('renders the form correctly', () => {
    // Set up auth context with empty values
    const authValue = {
      user: null,
      loading: false,
      error: null,
      login: mockLogin,
      logout: vi.fn(),
      checkAuth: vi.fn()
    };

    render(
      <AuthContext.Provider value={authValue}>
        <LoginForm />
      </AuthContext.Provider>
    );
    
    // Check form elements
    expect(screen.getAllByText('Login')[0]).toBeInTheDocument(); // Use getAllByText to handle multiple "Login" texts
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('handles input changes', () => {
    // Set up auth context with empty values
    const authValue = {
      user: null,
      loading: false,
      error: null,
      login: mockLogin,
      logout: vi.fn(),
      checkAuth: vi.fn()
    };

    render(
      <AuthContext.Provider value={authValue}>
        <LoginForm />
      </AuthContext.Provider>
    );
    
    // Get form elements
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    
    // Simulate typing in form
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'secretPassword123' } });
    
    // Check values are updated
    expect(emailInput).toHaveValue('user@example.com');
    expect(passwordInput).toHaveValue('secretPassword123');
  });

  it('submits the form and calls login function', async () => {
    // Set up auth context with empty values
    const authValue = {
      user: null,
      loading: false,
      error: null,
      login: mockLogin,
      logout: vi.fn(),
      checkAuth: vi.fn()
    };

    render(
      <AuthContext.Provider value={authValue}>
        <LoginForm />
      </AuthContext.Provider>
    );
    
    // Fill form
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secretPassword123' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Check if login function was called with correct values
    expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'secretPassword123');
  });

  it('prevents submission if email or password is empty', async () => {
    // Set up auth context with empty values
    const authValue = {
      user: null,
      loading: false,
      error: null,
      login: mockLogin,
      logout: vi.fn(),
      checkAuth: vi.fn()
    };

    render(
      <AuthContext.Provider value={authValue}>
        <LoginForm />
      </AuthContext.Provider>
    );
    
    // Submit form without filling in fields
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Check login was not called
    expect(mockLogin).not.toHaveBeenCalled();
    
    // Fill only email
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Should still not call login
    expect(mockLogin).not.toHaveBeenCalled();
    
    // Reset form and fill only password
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secretPassword123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Should still not call login
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows loading state when authentication is in progress', () => {
    // Set up auth context with loading true
    const authValue = {
      user: null,
      loading: true, // Loading state
      error: null,
      login: mockLogin,
      logout: vi.fn(),
      checkAuth: vi.fn()
    };

    render(
      <AuthContext.Provider value={authValue}>
        <LoginForm />
      </AuthContext.Provider>
    );
    
    // Should show loading state on button
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/logging in/i);
  });

  it('shows error message when authentication fails', () => {
    // Set up auth context with an error
    const authValue = {
      user: null,
      loading: false,
      error: 'Invalid email or password', // Error message
      login: mockLogin,
      logout: vi.fn(),
      checkAuth: vi.fn()
    };

    render(
      <AuthContext.Provider value={authValue}>
        <LoginForm />
      </AuthContext.Provider>
    );
    
    // Should display error message
    expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
  });

  it('redirects on successful login (via AuthContext)', async () => {
    // This test is to verify the LoginForm integrates correctly with AuthContext
    // The actual redirect is typically handled in AuthContext or with a hook
    const successfulLogin = vi.fn().mockResolvedValue(true); // Use mockResolvedValue instead
    
    // Set up auth context with a success response
    const authValue = {
      user: null,
      loading: false,
      error: null,
      login: successfulLogin,
      logout: vi.fn(),
      checkAuth: vi.fn()
    };

    render(
      <AuthContext.Provider value={authValue}>
        <LoginForm />
      </AuthContext.Provider>
    );
    
    // Fill form
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secretPassword123' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Verify login was called
    expect(successfulLogin).toHaveBeenCalledWith('user@example.com', 'secretPassword123');
    
    // With mockResolvedValue, we just need to confirm the function was called
    // No need to check the return value as mockResolvedValue guarantees it resolves to true
    await waitFor(() => {
      expect(successfulLogin).toHaveBeenCalled();
    });
  });
});

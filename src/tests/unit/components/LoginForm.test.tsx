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
});

// src/tests/unit/components/Header.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Header from '../../../components/Header';
import { AuthContext, AuthProvider } from '../../../context/AuthContext'; // Import AuthProvider too if needed for setup
import type { User } from '../../../context/AuthContext'; // Import User type

// Mock the AuthContext
const mockLogout = vi.fn();

const renderWithAuth = (user: User | null, loading: boolean = false) => {
  return render(
    <AuthContext.Provider value={{ user, login: vi.fn(), logout: mockLogout, loading, error: null, checkAuth: vi.fn() }}>
      <Header />
    </AuthContext.Provider>
  );
};

describe('Header Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockLogout.mockClear();
    // Mock window.location.href navigation
    Object.defineProperty(window, 'location', {
        value: {
            href: '/',
            assign: vi.fn(), // Mock assign if navigation is triggered directly
        },
        writable: true,
    });
  });

  it('renders the brand name', () => {
    renderWithAuth(null);
    expect(screen.getByRole('link', { name: /cancergenix/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /cancergenix/i })).toHaveAttribute('href', '/');
  });

  it('shows Login link when user is not authenticated', () => {
    renderWithAuth(null);
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute('href', '/login');
    expect(screen.queryByText(/welcome/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
  });

  it('shows loading state', () => {
    renderWithAuth(null, true);
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
  });

  it('shows welcome message and Logout button when user is authenticated', () => {
    const testUser: User = { id: '1', name: 'Test User', role: 'patient', token: 'token' };
    renderWithAuth(testUser);
    expect(screen.getByText(/welcome, test user!/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument();
  });

  it('calls logout function when Logout button is clicked', () => {
    const testUser: User = { id: '1', name: 'Test User', role: 'patient', token: 'token' };
    renderWithAuth(testUser);
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  // Test navigation links based on roles
  it('shows correct links for a patient', () => {
    const testUser: User = { id: '1', name: 'Patient Zero', role: 'patient', token: 'token' };
    renderWithAuth(testUser);
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /chat/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /dashboard/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /manage users/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /manage accounts/i })).not.toBeInTheDocument();
  });

  it('shows correct links for a clinician', () => {
    const testUser: User = { id: '2', name: 'Dr. Clinician', role: 'clinician', token: 'token' };
    renderWithAuth(testUser);
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /chat/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /manage users/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /manage accounts/i })).not.toBeInTheDocument();
  });

  it('shows correct links for an admin', () => {
    const testUser: User = { id: '3', name: 'Admin User', role: 'admin', token: 'token' };
    renderWithAuth(testUser);
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /chat/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /manage users/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /manage accounts/i })).not.toBeInTheDocument();
  });

  it('shows correct links for a super_admin', () => {
    const testUser: User = { id: '4', name: 'Super Admin', role: 'super_admin', token: 'token' };
    renderWithAuth(testUser);
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /chat/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /manage users/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /manage accounts/i })).toBeInTheDocument();
  });

  it('renders dashboard and logout links for authenticated regular user', () => {
    const user = { id: '1', email: 'user@example.com', role: 'user' };
    renderWithAuth(user);
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /create user/i })).not.toBeInTheDocument(); // Ensure admin links aren't shown
    expect(screen.queryByRole('link', { name: /create account/i })).not.toBeInTheDocument(); // Ensure admin links aren't shown
  });

  it('renders dashboard, admin links, and logout for authenticated admin user', () => {
    const user = { id: '2', email: 'admin@example.com', role: 'admin' };
    renderWithAuth(user);
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create user/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument();
  });
});

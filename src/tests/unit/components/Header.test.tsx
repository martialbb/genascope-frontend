// src/tests/unit/components/Header.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Header from '../../../components/Header';
import { AuthContext } from '../../../context/AuthContext';

// Mock the AuthContext
const mockLogout = vi.fn();

// Define user role type to match AuthContext
type UserRole = 'clinician' | 'admin' | 'super_admin';

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows logo and login link when user is not authenticated', () => {
    // Set up mock auth context with no user
    const authValue = {
      user: null,
      loading: false,
      error: null,
      login: vi.fn(),
      logout: mockLogout,
      checkAuth: vi.fn()
    };

    render(
      <AuthContext.Provider value={authValue}>
        <Header />
      </AuthContext.Provider>
    );

    // Check for logo/brand name
    expect(screen.getByText('Genascope')).toBeInTheDocument();
    
    // Check for login link when not authenticated
    const loginLink = screen.getByText('Login');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
    
    // Should not show logout button
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('shows user welcome and logout button when authenticated', () => {
    // Set up mock auth context with user
    const authValue = {
      user: { 
        id: 'user123', 
        name: 'Dr. Smith',
        email: 'smith@hospital.com',
        role: 'clinician' as UserRole
      },
      loading: false,
      error: null,
      login: vi.fn(),
      logout: mockLogout,
      checkAuth: vi.fn()
    };

    render(
      <AuthContext.Provider value={authValue}>
        <Header />
      </AuthContext.Provider>
    );

    // Check for welcome message
    expect(screen.getByText(/Welcome, Dr. Smith!/)).toBeInTheDocument();
    
    // Check for logout button
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
    
    // Should not show login link
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  it('calls logout function when logout button clicked', () => {
    // Set up mock auth context with user
    const authValue = {
      user: { 
        id: 'user123', 
        name: 'Dr. Smith',
        email: 'smith@hospital.com',
        role: 'clinician' as UserRole
      },
      loading: false,
      error: null,
      login: vi.fn(),
      logout: mockLogout,
      checkAuth: vi.fn()
    };

    render(
      <AuthContext.Provider value={authValue}>
        <Header />
      </AuthContext.Provider>
    );

    // Click logout button
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);
    
    // Verify logout was called
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    // Set up mock auth context with loading state
    const authValue = {
      user: null,
      loading: true, // Loading is true
      error: null,
      login: vi.fn(),
      logout: mockLogout,
      checkAuth: vi.fn()
    };

    render(
      <AuthContext.Provider value={authValue}>
        <Header />
      </AuthContext.Provider>
    );

    // Check for loading text
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows appropriate navigation links for clinician role', () => {
    // Set up mock auth context with clinician user
    const authValue = {
      user: { 
        id: 'user123', 
        name: 'Dr. Smith',
        email: 'smith@hospital.com',
        role: 'clinician' as UserRole
      },
      loading: false,
      error: null,
      login: vi.fn(),
      logout: mockLogout,
      checkAuth: vi.fn()
    };

    render(
      <AuthContext.Provider value={authValue}>
        <Header />
      </AuthContext.Provider>
    );

    // Check for expected clinician links
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /chat/i })).toHaveAttribute('href', '/chat');
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard');
    
    // Should not show admin links
    expect(screen.queryByRole('link', { name: /manage users/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /manage accounts/i })).not.toBeInTheDocument();
  });

  it('shows additional navigation links for admin role', () => {
    // Set up mock auth context with admin user
    const authValue = {
      user: { 
        id: 'admin123', 
        name: 'Admin User',
        email: 'admin@hospital.com',
        role: 'admin' as UserRole
      },
      loading: false,
      error: null,
      login: vi.fn(),
      logout: mockLogout,
      checkAuth: vi.fn()
    };

    render(
      <AuthContext.Provider value={authValue}>
        <Header />
      </AuthContext.Provider>
    );

    // Check for admin link
    expect(screen.getByRole('link', { name: /manage users/i })).toHaveAttribute('href', '/admin/create-user');
    
    // Should not show super_admin links
    expect(screen.queryByRole('link', { name: /manage accounts/i })).not.toBeInTheDocument();
  });

  it('shows all navigation links for super_admin role', () => {
    // Set up mock auth context with super_admin user
    const authValue = {
      user: { 
        id: 'superadmin123', 
        name: 'Super Admin',
        email: 'superadmin@genascope.com',
        role: 'super_admin' as UserRole
      },
      loading: false,
      error: null,
      login: vi.fn(),
      logout: mockLogout,
      checkAuth: vi.fn()
    };

    render(
      <AuthContext.Provider value={authValue}>
        <Header />
      </AuthContext.Provider>
    );

    // Check for super_admin link
    expect(screen.getByRole('link', { name: /manage accounts/i })).toHaveAttribute('href', '/admin/create-account');
  });
});

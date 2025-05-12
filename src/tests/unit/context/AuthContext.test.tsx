import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthContext, AuthProvider } from '../../../context/AuthContext';
import { vi, expect, describe, it, beforeEach } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock components for testing AuthContext
const TestComponent: React.FC = () => {
  const auth = React.useContext(AuthContext);

  return (
    <div>
      <div data-testid="user-info">
        {auth.user ? JSON.stringify(auth.user) : 'No user'}
      </div>
      <div data-testid="loading-state">{auth.loading ? 'Loading' : 'Not loading'}</div>
      <div data-testid="error-state">{auth.error || 'No error'}</div>
      <button
        data-testid="login-button"
        onClick={() => auth.login('admin@test.com', 'password')}
      >
        Login
      </button>
      <button 
        data-testid="invalid-login-button"
        onClick={() => auth.login('wrong@example.com', 'wrong-password')}
      >
        Invalid Login
      </button>
      <button data-testid="logout-button" onClick={auth.logout}>
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    localStorageMock.clear();
    
    // Mock window.location.href setting
    Object.defineProperty(window, 'location', {
      value: {
        href: ''
      },
      writable: true
    });
  });

  it('provides initial auth state with no user', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial auth check to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state').textContent).toBe('Not loading');
    });

    // After auth check completes, no user should be logged in
    expect(screen.getByTestId('user-info').textContent).toBe('No user');
    expect(screen.getByTestId('error-state').textContent).toBe('No error');
  });

  it('loads user from localStorage on mount', async () => {
    // Set initial user in localStorage
    const mockUser = { id: 'u003', email: 'clinician@test.com', name: 'Dr. Clinician', role: 'clinician', accountId: 'acc001' };
    localStorageMock.setItem('authUser', JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for auth check to complete and user to load
    await waitFor(() => {
      expect(screen.getByTestId('user-info').textContent).toContain('clinician@test.com');
    }, { timeout: 2000 });

    expect(screen.getByTestId('loading-state').textContent).toBe('Not loading');
    expect(screen.getByTestId('error-state').textContent).toBe('No error');
  });
});

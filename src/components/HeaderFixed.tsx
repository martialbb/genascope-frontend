// src/components/HeaderFixed.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const HeaderFixed: React.FC = () => {
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Directly check localStorage for user data
    const checkUserData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const storedUserStr = localStorage.getItem('authUser');

        console.log("HeaderFixed: Found token?", !!token);

        // If we have stored user data, use it
        if (storedUserStr) {
          try {
            const storedUser = JSON.parse(storedUserStr);
            console.log("HeaderFixed: Found stored user data", storedUser);
            setUser(storedUser);
            setLoading(false);
            return;
          } catch (e) {
            console.error("HeaderFixed: Error parsing stored user", e);
          }
        }

        // If we have a token but no stored user data, try to fetch it
        if (token) {
          console.log("HeaderFixed: Fetching user data with token");
          try {
            const response = await fetch('http://localhost:8000/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (response.ok) {
              const userData = await response.json();
              console.log("HeaderFixed: Received user data from API", userData);

              // Create a user object
              const userInfo = {
                id: userData.id || "",
                email: userData.email || "user@example.com",
                name: userData.name || userData.email?.split('@')[0] || "User",
                role: userData.role || "user"
              };

              // Store and set user info
              localStorage.setItem('authUser', JSON.stringify(userInfo));
              setUser(userInfo);
            } else {
              console.warn("HeaderFixed: Failed to fetch user data", response.status);
              setUser(null);
            }
          } catch (err) {
            console.error("HeaderFixed: Error fetching user data", err);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkUserData();
  }, []);

  // Simple hardcoded links for testing (will show regardless of user state)
  const defaultLinks = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  // User-specific links
  const userLinks = user ? [
    // Common links for logged in users
    { href: '/chat', label: 'Chat' },

    // Role-specific links
    ...(user.role === 'admin' || user.role === 'clinician' || user.role === 'physician' ? [
      { href: '/invite', label: 'Invite Patient' },
      { href: '/lab-order', label: 'Order Test' },
      { href: '/appointments-dashboard', label: 'Appointments' },
    ] : []),

    // Clinician links
    ...(user.role === 'clinician' ? [
      { href: '/manage-availability', label: 'My Availability' },
    ] : []),

    // Patient links
    ...(user.role === 'patient' ? [
      { href: '/schedule-appointment', label: 'Schedule Appointment' },
      { href: '/appointments-dashboard', label: 'My Appointments' },
    ] : []),

    // Admin links
    ...(user.role === 'admin' ? [
      { href: '/admin/users', label: 'Manage Users' },
      { href: '/admin/accounts', label: 'Manage Accounts' },
    ] : []),

    // Super admin links
    ...(user.role === 'super_admin' ? [
      { href: '/admin/create-account', label: 'Create Account' },
      { href: '/admin/accounts', label: 'Manage Accounts' },
      { href: '/admin/users', label: 'Manage Users' },
    ] : []),
  ] : [];

  const navLinks = [...defaultLinks, ...userLinks];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = async () => {
    try {
      // Clear data regardless of logout implementation
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');

      // Try to use context logout
      if (logout) {
        await logout();
      }

      // Ensure redirect
      window.location.href = '/login';
    } catch (error) {
      console.error("Error during logout", error);
      // Force redirect on error
      window.location.href = '/login';
    }
  };

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="text-lg font-bold text-blue-700">
            <a href="/">Genascope</a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-gray-500 hover:text-gray-700 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {/* Navigation Links */}
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}

            {/* Auth Status / Logout Button */}
            {loading ? (
              <span className="text-sm text-gray-500">Loading...</span>
            ) : user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">Welcome, {user.name || user.email}!</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded transition-colors duration-200"
              >
                Login
              </a>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="mt-4 pt-4 border-t border-gray-200 md:hidden">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="block py-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}

            {/* Auth Status / Logout Button for mobile */}
            {loading ? (
              <span className="block py-2 text-sm text-gray-500">Loading...</span>
            ) : user ? (
              <div className="py-2">
                <div className="mb-2 text-sm text-gray-700">Welcome, {user.name || user.email}!</div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className="block py-2"
              >
                <span className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded transition-colors duration-200">
                  Login
                </span>
              </a>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default HeaderFixed;

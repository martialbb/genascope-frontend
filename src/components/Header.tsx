// src/components/Header.tsx
import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout, loading } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  console.log("Header rendering with user:", user); // Add debug output

  // Basic navigation links - adjust based on roles and actual pages
  const navLinks = [
    { href: '/', label: 'Home' },
    user && { href: '/chat', label: 'Chat' },
    user && (user?.role === 'clinician' || user?.role === 'admin' || user?.role === 'physician') && { href: '/dashboard', label: 'Dashboard' },
    user && (user?.role === 'clinician' || user?.role === 'admin' || user?.role === 'physician') && { href: '/invite', label: 'Invite Patient' },
    user && (user?.role === 'clinician' || user?.role === 'admin' || user?.role === 'physician') && { href: '/lab-order', label: 'Order Test' },
    // Add appointment-related links
    user && (user?.role === 'clinician' || user?.role === 'admin' || user?.role === 'physician') && { href: '/appointments-dashboard', label: 'Appointments' },
    user && (user?.role === 'clinician') && { href: '/manage-availability', label: 'My Availability' },
    user && user?.role === 'patient' && { href: '/schedule-appointment', label: 'Schedule Appointment' },
    user && user?.role === 'patient' && { href: '/appointments-dashboard', label: 'My Appointments' },
    user && user?.role === 'admin' && { href: '/admin/create-user', label: 'Manage Users' },
    user && user?.role === 'super_admin' && { href: '/admin/create-account', label: 'Manage Accounts' },
  ].filter(Boolean); // Filter out false values (for conditional links)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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
                  onClick={logout}
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
                  onClick={logout}
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

export default Header;

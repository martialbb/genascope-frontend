// src/components/Header.tsx
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout, loading } = useContext(AuthContext);

  // Basic navigation links - adjust based on roles and actual pages
  const navLinks = [
    { href: '/', label: 'Home' },
    user && { href: '/chat', label: 'Chat' },
    user && (user.role === 'clinician' || user.role === 'admin' || user.role === 'physician') && { href: '/dashboard', label: 'Dashboard' },
    user && (user.role === 'clinician' || user.role === 'admin' || user.role === 'physician') && { href: '/invite', label: 'Invite Patient' },
    user && (user.role === 'clinician' || user.role === 'admin' || user.role === 'physician') && { href: '/lab-order', label: 'Order Test' },
    user && user.role === 'admin' && { href: '/admin/create-user', label: 'Manage Users' },
    user && user.role === 'super_admin' && { href: '/admin/create-account', label: 'Manage Accounts' },
  ].filter(Boolean); // Filter out false values (for conditional links)

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-lg font-bold text-blue-700">
          <a href="/">CancerGenix</a>
        </div>
        <div className="flex items-center space-x-4">
          {/* Navigation Links */}
          {navLinks.map((link) => (
            <a
              key={link.href}
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
              <span className="text-sm text-gray-700">Welcome, {user.name}!</span>
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
      </nav>
    </header>
  );
};

export default Header;

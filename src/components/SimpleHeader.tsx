import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

interface UserData {
  id: string;
  email: string;
  role: string;
  name?: string;
  account_id?: string;
}

interface AccountData {
  id: string;
  name: string;
  status: string;
}

const SimpleHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [account, setAccount] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountLoading, setAccountLoading] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('authUser');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          console.log('SimpleHeader: User authenticated', parsedUser);
          
          // Fetch account data if user has account_id
          if (parsedUser.account_id) {
            fetchAccountData(parsedUser.account_id);
          }
        } else {
          setUser(null);
          setAccount(null);
          console.log('SimpleHeader: No authentication found');
        }
      } catch (error) {
        console.error('SimpleHeader: Error checking auth status', error);
        setUser(null);
        setAccount(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for storage changes (e.g., when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isUserDropdownOpen && !target.closest('.user-dropdown')) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  // Fetch account data
  const fetchAccountData = async (accountId: string) => {
    setAccountLoading(true);
    try {
      const accountData = await apiService.getAccountById(accountId);
      setAccount(accountData);
      console.log('SimpleHeader: Account data fetched', accountData);
    } catch (error) {
      console.error('SimpleHeader: Error fetching account data', error);
      setAccount(null);
    } finally {
      setAccountLoading(false);
    }
  };

  // Check if user can edit accounts
  const canEditAccount = (user: UserData | null, account: AccountData | null): boolean => {
    if (!user || !account) return false;
    
    // Super admins can edit any account
    if (user.role === 'super_admin') return true;
    
    // Regular admins can edit their own account
    if (user.role === 'admin' && user.account_id === account.id) return true;
    
    return false;
  };

  // Simple hardcoded links for testing
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
      { href: '/patients', label: 'Patients' },
      { href: '/invite', label: 'Invite Patient' },
      { href: '/manage-invites', label: 'Manage Invites' },
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
  const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen);

  const handleNavClick = (href: string, label: string) => {
    console.log(`Navigation clicked: ${label} -> ${href}`);
    console.log('Current user role:', user?.role);
    
    // For the Patients link, add special handling
    if (href === '/patients') {
      console.log('Patients link clicked - checking user permissions');
      if (user && (user.role === 'admin' || user.role === 'clinician' || user.role === 'physician')) {
        console.log('User has permission to access patients page');
      } else {
        console.log('User does not have permission to access patients page');
      }
    }
  };

  const handleLogout = () => {
    console.log('SimpleHeader: Logout button clicked');
    
    // Clear all authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Update state
    setUser(null);
    
    console.log('SimpleHeader: Auth data cleared, redirecting to login');
    
    // Redirect to login with logout parameter
    window.location.href = '/login?logout=true';
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
                onClick={() => handleNavClick(link.href, link.label)}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}

            {/* Auth Status / User Info / Logout Button */}
            {loading ? (
              <span className="text-sm text-gray-500">Loading...</span>
            ) : user ? (
              <div className="relative user-dropdown">
                {/* User Dropdown Button */}
                <button
                  onClick={toggleUserDropdown}
                  className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  title="User menu"
                >
                  <span>Welcome, {user.name || user.email}</span>
                  <svg 
                    className={`h-4 w-4 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      {/* User Profile Link */}
                      <a
                        href={`/admin/edit-user/${user.id}`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <svg className="h-4 w-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Edit Profile
                      </a>

                      {/* Account Info */}
                      {account && (
                        <>
                          <div className="border-t border-gray-100 my-1"></div>
                          <div className="px-4 py-2">
                            <div className="text-xs text-gray-500 mb-1">Account</div>
                            {canEditAccount(user, account) ? (
                              <a
                                href={`/admin/edit-account/${account.id}`}
                                className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                {account.name}
                              </a>
                            ) : (
                              <div className="flex items-center text-sm text-gray-700">
                                <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                {account.name}
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* Logout Button */}
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <svg className="h-4 w-4 mr-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
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
                onClick={() => handleNavClick(link.href, link.label)}
                className="block py-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}

            {/* Auth Status / User Info / Logout Button for mobile */}
            {loading ? (
              <span className="block py-2 text-sm text-gray-500">Loading...</span>
            ) : user ? (
              <div className="py-2 border-t border-gray-200 mt-2 pt-4">
                {/* User Profile Link - Mobile */}
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1">User:</div>
                  <a
                    href={`/admin/edit-user/${user.id}`}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  >
                    <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {user.name || user.email}
                  </a>
                </div>

                {/* Account Info - Mobile */}
                {account && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">Account:</div>
                    {canEditAccount(user, account) ? (
                      <a
                        href={`/admin/edit-account/${account.id}`}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                      >
                        <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {account.name}
                      </a>
                    ) : (
                      <div className="flex items-center text-sm text-gray-700">
                        <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {account.name}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Logout Button - Mobile */}
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-3 rounded transition-colors duration-200"
                >
                  <svg className="h-4 w-4 mr-2 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
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

export default SimpleHeader;

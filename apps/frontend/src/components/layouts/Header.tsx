import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="font-heading text-2xl font-bold text-primary-600">
              Circa
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-primary-600 transition-colors">
              Home
            </Link>
            <Link to="/events" className="text-gray-700 hover:text-primary-600 transition-colors">
              Explore
            </Link>
            {isAuthenticated ? (
              <>
                <Link 
                  to="/create-event" 
                  className="bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Create Event
                </Link>
                <div className="relative">
                  <button
                    onClick={toggleMenu}
                    className="flex items-center focus:outline-none"
                  >
                    {user?.avatarMediaId ? (
                      <img
                        src={`/api/uploads/media/${user.avatarMediaId}`}
                        alt={user.displayName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                        {user?.displayName.charAt(0)}
                      </div>
                    )}
                    <span className="ml-2">{user?.displayName}</span>
                  </button>
                  
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={closeMenu}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/tickets"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={closeMenu}
                      >
                        My Tickets
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          closeMenu();
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Sign In
              </button>
            )}
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {isAuthenticated && (
              <Link 
                to="/create-event" 
                className="mr-4 bg-primary-600 text-white py-1.5 px-3 rounded-lg text-sm hover:bg-primary-700 transition-colors"
              >
                Create
              </Link>
            )}
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-2 border-t border-gray-200">
            <Link 
              to="/" 
              className="block py-2 text-gray-700 hover:text-primary-600"
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link 
              to="/events" 
              className="block py-2 text-gray-700 hover:text-primary-600"
              onClick={closeMenu}
            >
              Explore
            </Link>
            {isAuthenticated ? (
              <>
                <Link 
                  to="/profile" 
                  className="block py-2 text-gray-700 hover:text-primary-600"
                  onClick={closeMenu}
                >
                  Profile
                </Link>
                <Link 
                  to="/tickets" 
                  className="block py-2 text-gray-700 hover:text-primary-600"
                  onClick={closeMenu}
                >
                  My Tickets
                </Link>
                <button
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="block w-full text-left py-2 text-gray-700 hover:text-primary-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="block py-2 text-gray-700 hover:text-primary-600"
                onClick={closeMenu}
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
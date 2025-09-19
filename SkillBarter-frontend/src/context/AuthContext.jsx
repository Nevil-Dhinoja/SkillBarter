import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current user details from backend
  const fetchUserDetails = async (authToken = token) => {
    if (!authToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // Handle both response formats: data.user or data directly
        const userData = data.data.user || data.data;
        setUser(userData);
        setError(null);
        // Update localStorage with fresh user data
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        console.error('Failed to fetch user details:', data.message);
        if (response.status === 401) {
          // Token expired or invalid
          logout();
        }
        setError(data.message);
      }
    } catch (err) {
      console.error('Network error fetching user details:', err);
      setError('Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  // Initialize authentication state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Verify token is still valid by fetching user details
        fetchUserDetails(storedToken);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        logout();
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = (userData, authToken) => {
    // Handle both response formats: userData.user or userData directly
    const user = userData.user || userData;
    setUser(user);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(user));
    setError(null);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setError(null);
  };

  // Update user profile
  const updateUser = (updatedUserData) => {
    // Handle both response formats: updatedUserData.user or updatedUserData directly
    const user = updatedUserData.user || updatedUserData;
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    // Don't restart session timer when updating user profile
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!(token && user);
  };

  // Get user's full name
  const getUserFullName = () => {
    if (!user) return 'Guest';
    
    // Priority: full_name > email
    if (user.full_name) {
      return user.full_name;
    }
    
    return user.email || 'User';
  };

  // Get user's initials for avatar
  const getUserInitials = () => {
    if (!user) return 'G';
    
    // Use full_name to extract initials
    if (user.full_name) {
      const names = user.full_name.split(' ');
      const firstInitial = names[0]?.charAt(0) || '';
      const lastInitial = names[1]?.charAt(0) || '';
      return (firstInitial + lastInitial).toUpperCase() || 'U';
    }
    
    return user.email?.charAt(0).toUpperCase() || 'U';
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    updateUser,
    fetchUserDetails,
    isAuthenticated,
    getUserFullName,
    getUserInitials,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

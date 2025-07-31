import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const useSessionTimeout = () => {
  const navigate = useNavigate();
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const logoutRef = useRef();

  // Check if user is admin or subadmin
  const checkUserRole = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Session Timeout: No token found');
      return false;
    }

    try {
      const decoded = jwtDecode(token);
      const isAdminUser = decoded.role === 'admin' || decoded.role === 'subadmin';
      console.log('Session Timeout: User role:', decoded.role, 'Is admin:', isAdminUser);
      return isAdminUser;
    } catch (error) {
      console.error('Error decoding token:', error);
      return false;
    }
  }, []);

  // Calculate time left in session
  const calculateTimeLeft = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return 0;

    try {
      const decoded = jwtDecode(token);
      const tokenIssuedAt = decoded.iat * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const tenMinutesInMs = 10 * 60 * 1000; // 10 minutes in milliseconds
      const elapsed = currentTime - tokenIssuedAt;
      const remaining = tenMinutesInMs - elapsed;
      const remainingSeconds = Math.max(0, Math.floor(remaining / 1000));

      console.log('Session Timeout: Token issued at:', new Date(tokenIssuedAt).toLocaleTimeString());
      console.log('Session Timeout: Current time:', new Date(currentTime).toLocaleTimeString());
      console.log('Session Timeout: Elapsed time:', Math.floor(elapsed / 1000), 'seconds');
      console.log('Session Timeout: Time remaining:', remainingSeconds, 'seconds');

      return remainingSeconds;
    } catch (error) {
      console.error('Error calculating time left:', error);
      return 0;
    }
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('soc_username');
    localStorage.removeItem('soc_fullname');
    localStorage.removeItem('soc_email');
    localStorage.removeItem('role');
    
    setShowTimeoutModal(false);
    // Redirect to login page with session expired parameter
    navigate('/login?sessionExpired=true');
  }, [navigate]);

  // Store handleLogout in ref to avoid circular dependency
  logoutRef.current = handleLogout;

  // Handle user activity - reset timer on activity
  const handleUserActivity = useCallback(async (isUserAction = false) => {
    console.log('Session Timeout: handleUserActivity called, isAdmin:', isAdmin, 'isUserAction:', isUserAction);
    
    if (isAdmin) {
      console.log('Session Timeout: Admin user, no timeout applied');
      return; // No timeout for admin/subadmin
    }

    const remaining = calculateTimeLeft();
    console.log('Session Timeout: Time remaining:', remaining, 'seconds');
    
    if (isUserAction) {
      // User activity detected - refresh session and hide notification
      console.log('Session Timeout: User activity detected, refreshing session and hiding notification');
      setTimeLeft(0); // Hide the notification immediately
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch('http://localhost:3000/api/auth/refresh-session', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            // Update the token in localStorage with new timestamp
            localStorage.setItem('token', data.token);
            console.log('Session Timeout: Session refreshed successfully');
            // Close modal if it was open
            setShowTimeoutModal(false);
          } else {
            console.log('Session Timeout: Failed to refresh session, status:', response.status);
          }
        }
      } catch (error) {
        console.error('Error refreshing session on activity:', error);
        // Don't logout on refresh error, just continue with current token
      }
    } else if (remaining > 0) { // Show countdown banner for the full 10 minutes
      console.log('Session Timeout: Showing countdown banner with remaining time:', remaining);
      setTimeLeft(remaining);
      // Show banner for the full duration when user is inactive
    } else if (remaining <= 0) {
      console.log('Session Timeout: Session expired, logging out');
      setTimeLeft(0); // Ensure timeLeft is set to 0
      logoutRef.current();
    } else {
      // Show timer for remaining time when user is inactive
      setTimeLeft(remaining);
      console.log('Session Timeout: Showing timer with remaining time:', remaining);
    }
  }, [isAdmin, calculateTimeLeft]);

  // Extend session by refreshing token
  const extendSession = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        logoutRef.current();
        return;
      }

      // Make a request to refresh the session
      const response = await fetch('http://localhost:3000/api/auth/refresh-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Update the token in localStorage
        localStorage.setItem('token', data.token);
        // Close modal
        setShowTimeoutModal(false);
      } else {
        // Session expired, logout
        logoutRef.current();
      }
    } catch (error) {
      console.error('Error extending session:', error);
      logoutRef.current();
    }
  }, []);

  // Initialize session monitoring
  useEffect(() => {
    console.log('Session Timeout: Initializing session monitoring');
    const adminStatus = checkUserRole();
    setIsAdmin(adminStatus);
    console.log('Session Timeout: Admin status set to:', adminStatus);

    if (adminStatus) {
      console.log('Session Timeout: Admin user detected, no timeout monitoring');
      // No timeout for admin/subadmin
      return;
    }

    console.log('Session Timeout: Regular user detected, starting timeout monitoring');
    
    // Check session status every 10 seconds (for testing)
    const interval = setInterval(() => {
      console.log('Session Timeout: Periodic check triggered');
      handleUserActivity();
    }, 10000);

    // Add event listeners for user activity with throttling
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    let lastActivityTime = 0;
    const throttleDelay = 30000; // 30 seconds between activity resets
    
    const resetTimer = () => {
      if (!isAdmin) {
        const now = Date.now();
        if (now - lastActivityTime > throttleDelay) {
          lastActivityTime = now;
          console.log('Session Timeout: User activity detected, resetting timer');
          handleUserActivity(true); // Pass true to indicate actual user activity
        } else {
          // Even if throttled, hide notification immediately on any activity
          console.log('Session Timeout: User activity detected, hiding notification immediately');
          setTimeLeft(0); // Hide notification immediately
        }
      }
    };

    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    console.log('Session Timeout: Event listeners added for:', events);

    return () => {
      console.log('Session Timeout: Cleaning up session monitoring');
      clearInterval(interval);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [checkUserRole, handleUserActivity, isAdmin]);

  return {
    showTimeoutModal,
    timeLeft,
    isAdmin,
    handleLogout,
    extendSession,
    setShowTimeoutModal
  };
};

export default useSessionTimeout; 
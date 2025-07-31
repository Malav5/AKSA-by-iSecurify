import React, { useState, useEffect } from 'react';

const SessionCountdownBanner = ({ timeLeft, onExtend, onLogout }) => {
  const [countdown, setCountdown] = useState(Math.max(0, timeLeft || 0));
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show banner when timeLeft is greater than 0 (after 2 minutes of inactivity)
    if (timeLeft > 0) {
      setIsVisible(true);
      setCountdown(timeLeft);
    } else {
      setIsVisible(false);
      setCountdown(0);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (isVisible && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsVisible(false); // Hide banner when countdown reaches 0
            if (typeof onLogout === 'function') {
              onLogout();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isVisible, countdown, onLogout]);

  // Add padding to body when banner is visible
  useEffect(() => {
    if (isVisible) {
      document.body.style.paddingTop = '80px';
    } else {
      document.body.style.paddingTop = '0px';
    }

    return () => {
      document.body.style.paddingTop = '0px';
    };
  }, [isVisible]);

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      // Reset body padding when component unmounts
      document.body.style.paddingTop = '0px';
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">
                Your session will expire in{' '}
                <span className="font-bold text-xl bg-red-600 px-2 py-1 rounded">
                  {formatTime(countdown)}
                </span>
              </p>
              <p className="text-xs opacity-90">
                For security reasons, your session will automatically end after 12 minutes of inactivity. Timer appears after 2 minutes of inactivity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionCountdownBanner; 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SessionTimeoutModal = ({ isOpen, onExtend, onLogout, timeLeft }) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(Math.max(0, timeLeft || 0));

  useEffect(() => {
    // Update countdown when timeLeft prop changes
    console.log('SessionTimeoutModal: timeLeft prop changed to:', timeLeft);
    if (timeLeft > 0) {
      setCountdown(timeLeft);
    }
  }, [timeLeft]);

  useEffect(() => {
    console.log('SessionTimeoutModal: Modal effect triggered, isOpen:', isOpen, 'countdown:', countdown);
    
    if (isOpen && countdown > 0) {
      console.log('SessionTimeoutModal: Starting countdown timer from:', countdown);
      const timer = setInterval(() => {
        setCountdown(prev => {
          console.log('SessionTimeoutModal: Countdown tick, prev:', prev);
          if (prev <= 1) {
            clearInterval(timer);
            console.log('SessionTimeoutModal: Countdown expired, logging out');
            onLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        console.log('SessionTimeoutModal: Cleaning up countdown timer');
        clearInterval(timer);
      };
    } else if (isOpen && countdown <= 0) {
      // If modal is open but countdown is 0 or negative, logout immediately
      console.log('SessionTimeoutModal: Modal open with 0 countdown, logging out');
      onLogout();
    }
  }, [isOpen, countdown, onLogout]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Debug logging
  console.log('SessionTimeoutModal: isOpen:', isOpen, 'timeLeft:', timeLeft, 'countdown:', countdown);

  if (!isOpen || timeLeft <= 0) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black bg-opacity-20 flex items-center justify-center z-50" style={{ backdropFilter: 'blur(8px)' }}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Session Timeout Warning
          </h2>
          <div className="mb-4">
            <p className="text-gray-600 mb-2">Your session will expire in:</p>
            <div className="text-3xl font-bold text-red-500 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
              {formatTime(countdown)}
            </div>
          </div>
                      <p className="text-sm text-gray-500 mb-6">
              For security reasons, regular user sessions expire after 10 minutes of inactivity. Your session will automatically reset when you're active.
            </p>
          
          <div className="flex gap-3">
            <button
              onClick={onExtend}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Extend Session
            </button>
            <button
              onClick={onLogout}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Logout Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutModal; 
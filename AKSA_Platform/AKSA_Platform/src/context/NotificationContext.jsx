// src/context/NotificationContext.jsx
import React, { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

// src/context/NotificationContext.jsx
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, icon = "🔔") => {
    const newNote = {
      message,
      icon,
      time: new Date().toLocaleTimeString(),
    };
    setNotifications((prev) => [newNote, ...prev]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, clearNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

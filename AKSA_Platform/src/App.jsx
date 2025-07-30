import { useState } from "react";
import React from "react";
import "./App.css";
import "./index.css";
import AppRoutes from "./routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useSessionTimeout from "./hooks/useSessionTimeout";
import SessionTimeoutModal from "./components/ui/SessionTimeoutModal";
import SessionCountdownBanner from "./components/ui/SessionCountdownBanner";

function App() {
  const [count, setCount] = useState(0);
  const {
    showTimeoutModal,
    timeLeft,
    handleLogout,
    extendSession,
    setShowTimeoutModal
  } = useSessionTimeout();

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <SessionCountdownBanner
        timeLeft={timeLeft}
        onExtend={extendSession}
        onLogout={handleLogout}
      />
      <AppRoutes />
      <SessionTimeoutModal
        isOpen={showTimeoutModal}
        timeLeft={timeLeft}
        onExtend={extendSession}
        onLogout={handleLogout}
      />
    </>
  );
}

export default App;

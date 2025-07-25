import { useState } from "react";
import React from "react";
import "./App.css";
import "./index.css";
import AppRoutes from "./routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <AppRoutes />
    </>
  );
}

export default App;

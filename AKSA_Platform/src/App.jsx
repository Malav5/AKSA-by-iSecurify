import { useState } from "react";
import React from "react";
import "./App.css";
import "./index.css"; 
import AppRoutes from "./routes";
function App() {
  const [count, setCount] = useState(0);

  return <AppRoutes />;
}

export default App;

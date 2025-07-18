import React from "react";
import { Routes, Route, Router } from "react-router-dom";
import Login from "./components/Pages/Login";
import SignUp from "./components/Pages/SignUp";
import Dashboard from "./components/Pages/Dashboard";
import Issues from "./components/Pages/Issues";
import CompanyProfile from "./components/Dashboard/CompanyProfile";
import Settings from "./components/Dashboard/Settings";
import IssuesPage from "./components/Pages/IssuePage";
import TaskManager from "./components/Pages/TaskManager";
import RiskManager from "./components/Pages/RiskManager";
import Home from "./components/Pages/Home";
import DomainDetail from "./components/Pages/DomainDetail";
import SOCDashboard from "./components/Pages/SOCDashboard";
import SOCLogin from "./components/Pages/SOCLogin";
import PaymentPortal from "./components/Pages/PaymentPortal";
import Vulnerabilities from "./components/SOCDashboard/Vulnerabilities";
import Alerts from "./components/SOCDashboard/Alerts";
import Settings1 from "./components/SOCDashboard/settings1";
import UserDashboard from "./components/Pages/UserDashboard";
import AssignAgent from "./components/SOCDashboard/AssignAgent";
import Policies from "./components/Dashboard/Policies";
import SOC from "./components/Pages/SOC";
import AdminDashboard from "./components/Pages/AdminDashboard";

const AppRoutes = () => {
  // Role-based dashboard selection
  const role = localStorage.getItem('role');
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/domain" element={<DomainDetail />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/issues" element={<Issues />} />
      <Route path="/issuePage" element={<IssuesPage />} />
      <Route path="/company-profile" element={<CompanyProfile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/settings1" element={<Settings1 />} />
      <Route path="/task-manager" element={<TaskManager />} />
      <Route path="/risk-manager" element={<RiskManager />} />
      <Route path="/soc" element={role === 'admin' ? <SOCDashboard /> : <UserDashboard />} />
      <Route path="/soc-login" element={<SOCLogin />} />
      <Route path="/payment-portal" element={<PaymentPortal />} />
      <Route path="/logs" element={<Vulnerabilities />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/assign-agent" element={<AssignAgent />} />
      <Route path="/policies" element={<Policies />} />
      <Route path="/soc-dashboard" element={<SOC />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
    </Routes>
  );
};

export default AppRoutes;

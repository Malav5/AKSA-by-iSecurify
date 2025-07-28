import React from "react";
import { Routes, Route, Router } from "react-router-dom";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import Dashboard from "./Pages/Dashboard";
import Issues from "./Pages/Issues";
import CompanyProfile from "./components/Dashboard/CompanyProfile"
import Settings from "./components/Dashboard/Settings";
// import IssuesPage from "./Pages/IssuePage";
import TaskManager from "./Pages/TaskManager";
import RiskManager from "./Pages/RiskManager";
import Home from "./Pages/Home";
import DomainDetail from "./Pages/DomainDetail";
import SOCDashboard from "./Pages/SOCDashboard";
import SOCLogin from "./Pages/SOCLogin";
import PaymentPortal from "./Pages/PaymentPortal";
import Vulnerabilities from "./components/SOCDashboard/Vulnerabilities";
import Alerts from "./components/SOCDashboard/Alerts";
import Settings1 from "./components/SOCDashboard/settings1";
import UserDashboard from "./Pages/UserDashboard";
import AssignAgent from "./components/SOCDashboard/AssignAgent";
import Policies from "./components/Dashboard/Policies";
import SOC from "./Pages/SOC";
import AdminDashboard from "./Pages/AdminDashboard";
import UpgradePlan from "./Pages/UpgradePlan";
import DeadDashboard from "./Pages/DeadDashboard";
import Deaddashboard1 from "./Pages/Deaddashboard1";
import VerifyEmail from "./Pages/VerifyEmail";
const AppRoutes = () => {
  // Role-based dashboard selection
  const role = localStorage.getItem('role');
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/domain" element={<DomainDetail />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<Deaddashboard1 />} />
      <Route path="/issues" element={<Issues />} />
      {/* <Route path="/issuePage" element={<IssuesPage />} /> */}
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
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/upgrade-plan" element={<UpgradePlan />} />
      <Route path="/deaddashboard" element={<DeadDashboard />} />
      <Route path="/dead-dashboard" element={<Dashboard />} />
      <Route path="/verify-email" element={<VerifyEmail />} />


    </Routes>
  );
};

export default AppRoutes;

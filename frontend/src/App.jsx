import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./index.css";
import { UserProvider, useUser } from "./context/UserContext";
import BalanceProvider from "./components/BalanceProvider/BalanceProvider";
import Navbar from "./components/Navbar/Navbar";

import ProfilePage from "./components/Profile/ProfilePage";
import Transactions from "./components/Transactions/Transactions";
import Home from "./components/Home/Home";
import IdManager from "./components/Id/Id";
import AllIds from "./components/admin/AllIds/AllIds";
import Websites from "./components/admin/Websites/Websites";
import IdRequests from "./components/admin/IdRequests/IdRequests";
import Users from "./components/admin/Users/Users";
import SubAdmins from "./components/admin/SubAdmins/SubAdmins";
import AdminAccountsDetails from "./components/admin/AdminAccountsDetails/AdminAccountsDetails";
import Signup from "./components/Signup/Signup";
import Login from "./components/Login/Login";
import FloatingSocialWidget from "./components/FloatingSocialWidget/FloatingSocialWidget";

import ProtectedRoute from "./components/Login/ProtectedRoute"; // Import ProtectedRoute
import Dashboard from "./components/Dashboard/Dashboard";
import { ADMIN_ROLES, ALL_AUTHENTICATED_ROLES } from "./utils/roles";

function App() {
  return (
    <UserProvider>
      <BalanceProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          {/* Render the unified navbar for all users */}
          <Navbar />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Unified Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={ALL_AUTHENTICATED_ROLES}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected User Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={ALL_AUTHENTICATED_ROLES}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute allowedRoles={ALL_AUTHENTICATED_ROLES}>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/id"
              element={
                <ProtectedRoute allowedRoles={ALL_AUTHENTICATED_ROLES}>
                  <IdManager />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/home"
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/subadmins"
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <SubAdmins />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/accounts-details"
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <AdminAccountsDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/transactions"
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/id"
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <AllIds />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/all-ids"
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <AllIds />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/websites"
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <Websites />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/id-requests"
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <IdRequests />
                </ProtectedRoute>
              }
            />
          </Routes>

          {/* Floating Expandable Social / Support Widget */}
          <FloatingSocialWidget />
        </Router>
      </BalanceProvider>
    </UserProvider>
  );
}

export default App;

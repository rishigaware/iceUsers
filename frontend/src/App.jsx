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
import { ROUTES } from "./utils/routes";

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
            <Route path={ROUTES.HOME} element={<Home />} />
            <Route path={ROUTES.LOGIN} element={<Login />} />
            <Route path={ROUTES.SIGNUP} element={<Signup />} />

            {/* Unified Dashboard Routes */}
            <Route
              path={ROUTES.DASHBOARD}
              element={
                <ProtectedRoute allowedRoles={ALL_AUTHENTICATED_ROLES}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN_DASHBOARD}
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected User Routes */}
            <Route
              path={ROUTES.PROFILE}
              element={
                <ProtectedRoute allowedRoles={ALL_AUTHENTICATED_ROLES}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.TRANSACTIONS}
              element={
                <ProtectedRoute allowedRoles={ALL_AUTHENTICATED_ROLES}>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ID}
              element={
                <ProtectedRoute allowedRoles={ALL_AUTHENTICATED_ROLES}>
                  <IdManager />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path={ROUTES.ADMIN_HOME}
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN_SUBADMINS}
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <SubAdmins />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN_ACCOUNTS_DETAILS}
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <AdminAccountsDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN_PROFILE}
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN_TRANSACTIONS}
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN_ID}
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <AllIds />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN_ALL_IDS}
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <AllIds />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN_WEBSITES}
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <Websites />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN_USERS}
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN_ID_REQUESTS}
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

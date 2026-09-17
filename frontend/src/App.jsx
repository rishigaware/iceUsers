import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import { UserProvider, useUser } from './context/UserContext'; 
import BalanceProvider from './components/BalanceProvider/BalanceProvider';
import Navbar from './components/Navbar/Navbar';
import AdminNavbar from './components/admin/components/Navbar/Navbar';

import ProfilePage from './components/Profile/ProfilePage';
import AdminProfilePage from './components/admin/components/Profile/ProfilePage';
import Transactions from './components/Transection/Transactions';
import AdminTransactions from './components/admin/components/Transection/Transactions';
import Home from './components/Home/Home';
import AdminHome from './components/admin/components/Home/Home';
import IdManager from './components/Id/Id';
import AdminIdManager from './components/admin/components/Id/Id';
import IdRequests from './components/admin/components/IdRequests/IdRequests';
import Users from './components/admin/components/Users/Users';
import SubAdmins from './components/admin/components/SubAdmins/SubAdmins';
import AdminAccountsDetails from './components/admin/components/AdminAccountsDetails/AdminAccountsDetails';
import Signup from './components/Signup/Signup';
import Login from './components/Login/Login';
import FloatingSocialWidget from './components/FloatingSocialWidget/FloatingSocialWidget';

import ProtectedRoute from './components/Login/ProtectedRoute'; // Import ProtectedRoute
import Dashboard from './components/Dashboard/Dashboard';

const RoleBasedNavbar = () => {
  const { user } = useUser(); // Access the current user from the context

  if (user?.role === 'admin' || user?.role === 'superadmin') {
    return <AdminNavbar />; // Render AdminNavbar if the user is an admin or superadmin
  }

  return <Navbar />; // Render User Navbar for other roles or guests
};


function App() {
  return (
    <UserProvider>
      <BalanceProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          {/* Render the navbar for all users */}
          <RoleBasedNavbar />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Unified Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'master', 'superadmin']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin', 'master', 'superadmin']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected User Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'master', 'superadmin']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'master', 'superadmin']}>
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/id"
            element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'master', 'superadmin']}>
                <IdManager />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/home"
            element={
              <ProtectedRoute allowedRoles={['admin', 'master', 'superadmin']}>
                <AdminHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subadmins"
            element={
              <ProtectedRoute allowedRoles={['admin', 'master', 'superadmin']}>
                <SubAdmins />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/accounts-details"
            element={
              <ProtectedRoute allowedRoles={['admin', 'master', 'superadmin']}>
                <AdminAccountsDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute allowedRoles={['admin', 'master', 'superadmin']}>
                <AdminProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/transactions"
            element={
              <ProtectedRoute allowedRoles={['admin', 'master', 'superadmin']}>
                <AdminTransactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/id"
            element={
              <ProtectedRoute allowedRoles={['admin', 'master', 'superadmin']}>
                <AdminIdManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin', 'master', 'superadmin']}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/id-requests"
            element={
              <ProtectedRoute allowedRoles={['admin', 'master', 'superadmin']}>
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

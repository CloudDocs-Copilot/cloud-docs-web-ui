
import './App.css'
import Dashboard from './pages/Dashboard'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home';
import { UserProfile } from './pages/UserProfile'
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import LoginPage from './pages/LoginPage'
import PrivateRoute from './components/PrivateRoute'
import ConfirmAccount from './pages/ConfirmAccount'
import CreateOrganization from './pages/CreateOrganization'
import NoOrganization from './pages/NoOrganization'
import RequireOrganization from './components/RequireOrganization'
import OrganizationSettings from './pages/OrganizationSettings'

import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
   
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
          element={
            <PrivateRoute>
              <RequireOrganization>
                <Dashboard />
              </RequireOrganization>
            </PrivateRoute>
          }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>              
            <UserProfile />              
          </PrivateRoute>
        }
      />
        <Route path="/create-organization" element={<PrivateRoute><CreateOrganization /></PrivateRoute>} />
        <Route path="/no-organization" element={<PrivateRoute><NoOrganization /></PrivateRoute>} />
        <Route path="/organization/settings" element={<PrivateRoute><RequireOrganization><OrganizationSettings/></RequireOrganization></PrivateRoute>} />
      <Route path="/auth/confirmed" element={<ConfirmAccount />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App


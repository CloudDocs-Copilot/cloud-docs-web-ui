
import './App.css'
import Dashboard from './pages/Dashboard'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home';
import { UserProfile } from './pages/UserProfile'
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';
import Register from './pages/Register';
import LoginPage from './pages/LoginPage'
import PrivateRoute from './components/PrivateRoute'
import RequireRole from './components/RequireRole'
import ConfirmAccount from './pages/ConfirmAccount'
import CreateOrganization from './pages/CreateOrganization'
import NoOrganization from './pages/NoOrganization'
import RequireOrganization from './components/Organization/RequireOrganization'
import OrganizationSettings from './pages/OrganizationSettings'
import PendingInvitations from './pages/PendingInvitations'
import TrashPage from './pages/TrashPage'
import SearchPage from './pages/SearchPage'

import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import SharedDocs from './pages/SharedDocs';


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
        path="/trash"
        element={
          <PrivateRoute>
            <RequireOrganization>
              <TrashPage />
            </RequireOrganization>
          </PrivateRoute>
        }
      />
      <Route
        path="/search"
        element={
          <PrivateRoute>
            <RequireOrganization>
              <SearchPage />
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
        <Route path="/organization/settings" element={<PrivateRoute><RequireOrganization><RequireRole roles={['admin', 'owner']}><OrganizationSettings/></RequireRole></RequireOrganization></PrivateRoute>} />
        <Route path="/invitations" element={<PrivateRoute><PendingInvitations /></PrivateRoute>} />
        <Route path="/shared" element={<PrivateRoute><SharedDocs /></PrivateRoute>} />
      <Route path="/auth/confirmed" element={<ConfirmAccount />} />
      <Route path="/forbidden" element={<PrivateRoute><Forbidden /></PrivateRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App


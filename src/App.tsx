
import React, { Suspense } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home';
import LoginPage from './pages/LoginPage'
import NotFound from './pages/NotFound';
import ConfirmAccount from './pages/ConfirmAccount'
import PrivateRoute from './components/PrivateRoute'
import RequireRole from './components/RequireRole'
import RequireOrganization from './components/Organization/RequireOrganization'
import { Loader } from './components/Loader';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const TrashPage = React.lazy(() => import('./pages/TrashPage'));
const SearchPage = React.lazy(() => import('./pages/SearchPage'));
const UserProfile = React.lazy(() => import('./pages/UserProfile').then(m => ({ default: m.UserProfile })));
const Forbidden = React.lazy(() => import('./pages/Forbidden'));
const Register = React.lazy(() => import('./pages/Register'));
const CreateOrganization = React.lazy(() => import('./pages/CreateOrganization'));
const NoOrganization = React.lazy(() => import('./pages/NoOrganization'));
const OrganizationSettings = React.lazy(() => import('./pages/OrganizationSettings'));
const PendingInvitations = React.lazy(() => import('./pages/PendingInvitations'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage'));
const SharedDocs = React.lazy(() => import('./pages/SharedDocs'));
const Notifications = React.lazy(() => import('./pages/Notifications'));


function App() {
  return (
    <Suspense fallback={<Loader fullScreen message="Cargando..." />}>
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
        <Route path="/notifications" element={<PrivateRoute><RequireOrganization><Notifications /></RequireOrganization></PrivateRoute>} />
      <Route path="/auth/confirmed" element={<ConfirmAccount />} />
      <Route path="/forbidden" element={<PrivateRoute><Forbidden /></PrivateRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
  );
}

export default App


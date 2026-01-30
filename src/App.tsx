
import { useState } from 'react'
import { useNavigate } from 'react-router-dom' 
import './App.css'


import Dashboard from './pages/Dashboard'
import { Routes, Route } from 'react-router-dom'

import Home from './pages/Home';
import { UserProfile } from './components/UserProfile'
import './App.css'
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import LoginPage from './pages/LoginPage'
import PrivateRoute from './components/PrivateRoute'
import ConfirmAccount from './pages/ConfirmAccount'
import CreateOrganization from './pages/CreateOrganization'
import NoOrganization from './pages/NoOrganization'
import RequireOrganization from './components/RequireOrganization'
import OrganizationSettings from './pages/OrganizationSettings'

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: 'Juan Pérez', email: 'juan@ejemplo.com' })

  const handleSave = (name: string, email: string, password?: string) => {
    setUser({ name, email })
    console.log('Usuario actualizado:', { name, email, password: password ? '***' : 'sin cambio' })
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
   
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
              <RequireOrganization>
                <UserProfile
                  user={user}
                  onSave={handleSave}
                  onBack={() => navigate('/dashboard')}
                />
              </RequireOrganization>
            </PrivateRoute>
          }
        />
        <Route path="/create-organization" element={<PrivateRoute><CreateOrganization /></PrivateRoute>} />
        <Route path="/no-organization" element={<PrivateRoute><NoOrganization /></PrivateRoute>} />
        <Route path="/organization/settings" element={<PrivateRoute><RequireOrganization><OrganizationSettings/></RequireOrganization></PrivateRoute>} />
        <Route path="/auth/confirmed" element={<ConfirmAccount />} />
      

      <Route path="*" element = {<NotFound/>} />
    </Routes>
  );
}

export default App


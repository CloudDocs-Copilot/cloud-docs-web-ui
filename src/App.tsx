
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
          element={<PrivateRoute><Dashboard /></PrivateRoute>}
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <UserProfile
                user={user}
                onSave={handleSave}
                onBack={() => navigate('/dashboard')}
              />
            </PrivateRoute>
          }
        />
      

      <Route path="*" element = {<NotFound/>} />
    </Routes>
  );
}

export default App


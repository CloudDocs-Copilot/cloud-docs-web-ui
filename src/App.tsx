import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'

import './App.css'
/*
import Dashboard from './pages/Dashboard'
import { Routes, Route } from 'react-router-dom'

import Home from './pages/Home';
import { UserProfile } from './components/UserProfile'
import './App.css'
import NotFound from './pages/NotFound';
import Register from './pages/Register';

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
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<UserProfile 
            user={user} 
            onSave={handleSave} 
            onBack={() => navigate('/dashboard')} />} />

      <Route path="*" element = {<NotFound/>} />
    </Routes>
  );
}

export default App
*/ 

// ACTUALIZACIÓN PARA LOGIN
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Routes>
      {/* públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />

      {/* protegidas */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

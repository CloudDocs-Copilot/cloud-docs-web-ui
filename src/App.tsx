
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

function App() {
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
            <UserProfile />
          </PrivateRoute>
        }
      />
      <Route path="/auth/confirmed" element={<ConfirmAccount />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App


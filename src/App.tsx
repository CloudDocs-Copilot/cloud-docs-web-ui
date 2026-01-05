import Dashboard from './pages/Dashboard'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home';

function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App

import { useState } from 'react'
import { UserProfile } from './components/UserProfile'
import './App.css'

function App() {
  const [showProfile, setShowProfile] = useState(true)
  const [user, setUser] = useState({ name: 'Juan Pérez', email: 'juan@ejemplo.com' })

  const handleSave = (name: string, email: string, password?: string) => {
    setUser({ name, email })
    console.log('Usuario actualizado:', { name, email, password: password ? '***' : 'sin cambio' })
    alert('¡Perfil actualizado exitosamente!')
  }

  const handleBack = () => {
    setShowProfile(false)
    alert('Volviendo al dashboard...')
  }

  if (!showProfile) {
    return (
      <div className="container mt-5 text-center">
        <h1>Dashboard Principal</h1>
        <button 
          className="btn btn-primary mt-3"
          onClick={() => setShowProfile(true)}
        >
          Ver mi perfil
        </button>
      </div>
    )
  }

  return (
    <UserProfile 
      user={user}
      onSave={handleSave}
      onBack={handleBack}
    />
  )
}

export default App

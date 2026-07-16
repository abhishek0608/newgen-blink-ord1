import { useState } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Products from './pages/Products.jsx'

function AppLayout({ isLoggedIn, onLogout }) {
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return (
    <>
      <Navbar onLogout={onLogout} />
      <Outlet />
    </>
  )
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => sessionStorage.getItem('loggedIn') === 'true',
  )

  function handleLogin() {
    sessionStorage.setItem('loggedIn', 'true')
    setIsLoggedIn(true)
  }

  function handleLogout() {
    sessionStorage.removeItem('loggedIn')
    setIsLoggedIn(false)
  }

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route
        element={<AppLayout isLoggedIn={isLoggedIn} onLogout={handleLogout} />}
      >
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

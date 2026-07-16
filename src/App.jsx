import { useState } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Products from './pages/Products.jsx'
import AiHelp from './pages/AiHelp.jsx'
import Test from './pages/Test.jsx'
import Offers from './pages/Offers.jsx'

function AppLayout({ isLoggedIn }) {
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return (
    <>
      <Navbar />
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

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route element={<AppLayout isLoggedIn={isLoggedIn} />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/ai-help" element={<AiHelp />} />
        <Route path="/test" element={<Test />} />
        <Route path="/offers" element={<Offers />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

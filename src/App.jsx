import { useState } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Products from './pages/Products.jsx'
import ProductsBasic from './pages/ProductsBasic.jsx'
import ProductsHeadless from './pages/ProductsHeadless.jsx'
import ProductsGithub from './pages/ProductsGithub.jsx'
import ProductsHmhCatalog from './pages/ProductsHmhCatalog.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import { CartProvider } from './cart/CartContext.jsx'

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
    <CartProvider>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route
          element={<AppLayout isLoggedIn={isLoggedIn} onLogout={handleLogout} />}
        >
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/basic" element={<ProductsBasic />} />
          <Route path="/products/headless" element={<ProductsHeadless />} />
          <Route path="/products/github" element={<ProductsGithub />} />
          <Route path="/products/hmh-catalog" element={<ProductsHmhCatalog />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CartProvider>
  )
}

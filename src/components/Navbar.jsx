import { useEffect, useState } from 'react'
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../cart/CartContext.jsx'
import Logo from './Logo.jsx'

const links = [
  { to: '/', label: 'HOME' },
  { to: '/products/basic', label: 'BASIC' },
  { to: '/products', label: 'UI CHANGE' },
  { to: '/products/headless', label: 'HEADLESS' },
  { to: '/products/github', label: 'GITHUB SOURCE' },
  { to: '/products/hmh-catalog', label: 'HMH CATALOG' },
]

export default function Navbar({ onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const cart = useCart()
  const [showMenu, setShowMenu] = useState(false)
  const cartCount = cart.itemCount

  useEffect(() => {
    setShowMenu(false)
  }, [location.pathname])

  function handleLogout() {
    setShowMenu(false)
    onLogout()
    navigate('/login')
  }

  return (
    <nav className="ec-navbar">
      <div className="navbar-brand">
        <Link to="/">
          <Logo height={30} />
        </Link>
      </div>

      <div className="nav-collapse">
        <ul className="nav-left">
          {links.map(({ to, label }) => (
            <li key={to ?? label}>
              {to ? (
                <NavLink
                  to={to}
                  end={to === '/' || to === '/products'}
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  {label}
                </NavLink>
              ) : (
                <a href="#" onClick={(event) => event.preventDefault()}>
                  {label}
                </a>
              )}
            </li>
          ))}
        </ul>

        <div className="nav-search-wrap">
          <div className="nav-search-group">
            <div className="nav-search-dd">
              <select defaultValue="All" aria-label="Search category">
                <option value="All">All</option>
              </select>
            </div>
            <div className="nav-search-box">
              <input
                type="search"
                placeholder="Search..."
                aria-label="Search"
              />
              <span className="material-symbols-outlined search-icon">
                search
              </span>
            </div>
          </div>
        </div>

        <ul className="nav-right">
          <li className="nav-icon-item">
            <Link to="/cart" className="nav-icon-link" aria-label="Cart">
              <span className="material-symbols-outlined">shopping_cart</span>
              {cartCount > 0 && <span className="nav-icon-badge">{cartCount}</span>}
            </Link>
          </li>
          <li className="nav-icon-item">
            <a className="nav-icon-link" aria-label="Notifications">
              <span className="material-symbols-outlined">notifications</span>
            </a>
          </li>
          <li className="accli" onMouseLeave={() => setShowMenu(false)}>
            <div
              className={`ec-acc-wrapper${showMenu ? ' active' : ''}`}
              onClick={() => setShowMenu(!showMenu)}
            >
              <div className="ec-acc-btn">
                <div className="ec-acc-userphoto">
                  <span className="esg-pcolor-fc-small">SA</span>
                </div>
              </div>
              <div className="ec-acc-accountnamewrapper">
                <div className="ec-acc-accountname">
                  <div>
                    <p>Current Account</p>
                    <label>Ari Standard</label>
                  </div>
                  <i className="material-symbols-outlined">arrow_drop_down</i>
                </div>
                <div className="ec-acc-dropdown">
                  <div className="ec-acc-dcontent">
                    <div className="ec-acc-userblock">
                      <div className="ec-acc-userphoto-full">
                        <span className="esg-pcolor-fc">SA</span>
                      </div>
                      <div className="h5">Shek Agrawal</div>
                      <div className="h6">Ari Standard</div>
                    </div>
                    <div className="ec-acc-linkblock">
                      <a onClick={(e) => e.stopPropagation()}>
                        Switch Accounts
                      </a>
                      <a
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLogout()
                        }}
                      >
                        Logout
                      </a>
                    </div>
                  </div>
                  <div className="ec-acc-dcontent">
                    <a>My Profile</a>
                    <a>Orders</a>
                    <a>Manage Users</a>
                  </div>
                </div>
              </div>
            </div>
          </li>
          <li className="nav-icon-item nav-menu-item">
            <button className="nav-menu-button" type="button" aria-label="Menu">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}

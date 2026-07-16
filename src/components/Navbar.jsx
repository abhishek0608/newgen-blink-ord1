import { NavLink, Link } from 'react-router-dom'
import Logo from './Logo.jsx'

const links = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/ai-help', label: 'AI Help' },
  { to: '/test', label: 'Test', plain: true },
  { to: '/offers', label: 'Offers' },
]

export default function Navbar() {
  return (
    <header className="navbar">
      <Link to="/">
        <Logo />
      </Link>

      <nav className="nav-links">
        {links.map(({ to, label, plain }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `nav-link${plain ? ' plain' : ''}${isActive ? ' active' : ''}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="nav-spacer" />

      <div className="nav-search">
        <select defaultValue="all" aria-label="Search category">
          <option value="all">All</option>
        </select>
        <input type="text" placeholder="Search..." aria-label="Search" />
        <button type="button" className="search-btn" aria-label="Search">
          <SearchIcon />
        </button>
      </div>

      <div className="nav-actions">
        <button type="button" className="icon-btn" aria-label="Cart">
          <CartIcon />
        </button>
        <button type="button" className="icon-btn" aria-label="Notifications">
          <BellIcon />
        </button>
        <div className="avatar">SA</div>
        <div className="account-switcher">
          <div className="labels">
            <span className="caption">Current Account</span>
            <span className="name">Ari Standard</span>
          </div>
          <CaretIcon />
        </div>
        <button type="button" className="icon-btn" aria-label="Menu">
          <MenuIcon />
        </button>
      </div>
    </header>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M2 3h3l2.6 12.5a1 1 0 0 0 1 .8h9.7a1 1 0 0 0 1-.8L21 7H6" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 9a6 6 0 1 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 15 18 9" />
      <path d="M10.3 20a2 2 0 0 0 3.4 0" />
    </svg>
  )
}

function CaretIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 10l5 5 5-5z" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'

export default function Login({ onLogin }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('demo@newgen.com')
  const [password, setPassword] = useState('demo123')

  function handleSubmit(e) {
    e.preventDefault()
    // Dummy login — accepts anything
    onLogin()
    navigate('/')
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="brand">
          <Logo height={30} />
        </div>

        <h1>Sign In</h1>

        <div className="login-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="name@host.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="login-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="login-btn">
          Sign In
        </button>

        <a
          className="forgot-link"
          href="#forgot"
          onClick={(e) => e.preventDefault()}
        >
          Forgot your password?
        </a>
      </form>
    </div>
  )
}

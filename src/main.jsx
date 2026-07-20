import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import '@nextgen-composable/next-gen-composable/styles.css'
import './index.css'
import './theme.css'
import './catalog.css'
import './headless.css'
import './hmh-catalog.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

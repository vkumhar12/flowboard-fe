import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Apply persisted preferences before first paint.
if (localStorage.getItem('pref-reduced-motion') === 'true') {
  document.documentElement.dataset.reduceMotion = 'true'
}
if (localStorage.getItem('pref-theme') === 'dark') {
  document.documentElement.dataset.theme = 'dark'
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

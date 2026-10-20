import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// CHALLENGE (base64): a message for anyone who opens the browser console.
console.log(
  '%c🦇 Cryptbook 🦇',
  'font-family: Creepster, cursive; font-size: 40px; color: #ff7a18; text-shadow: 0 0 10px #ff7a18;',
)
console.log(
  '%cThe spirits speak in a tongue of 64 letters:\n%cSEFMTE9Xe3RoM19sNHR0M193NHNfbDRjM2R9',
  'color: #9c8db3; font-style: italic;',
  'color: #8bd450; font-family: monospace; font-size: 14px;',
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

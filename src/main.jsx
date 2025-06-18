import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './Context/authContext.jsx'
import swDev from './swDev.js'
import { initializePWAInstall } from './pwInstall.js'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <StrictMode>
      <App />
    </StrictMode>
  </AuthProvider>
)

swDev()

document.addEventListener('DOMContentLoaded', () => {
  initializePWAInstall();
});
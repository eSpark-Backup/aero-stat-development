import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import ThemeHandler from './ThemeHandler.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeHandler>
      <App />
    </ThemeHandler>
  </StrictMode>,
)

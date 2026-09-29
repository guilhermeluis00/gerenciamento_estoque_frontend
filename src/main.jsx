import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { applyTheme, getSavedTheme } from './theme'

// Aplica a cor de tema salva (ou o padrão laranja) antes de renderizar,
// pra não piscar com a cor errada no primeiro frame.
applyTheme(getSavedTheme())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
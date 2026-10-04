import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { applyMode, applyTheme, getSavedMode, getSavedTheme } from './theme'

// Aplica a cor e o modo (claro/escuro) salvos antes de renderizar,
// pra não piscar com a cor errada no primeiro frame.
applyTheme(getSavedTheme())
applyMode(getSavedMode())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

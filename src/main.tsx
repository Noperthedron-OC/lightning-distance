import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/lato/latin-400.css'
import '@fontsource/lato/latin-700.css'
import App from './App'
import './design-system/fonts.css'
import './design-system/tokens.css'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

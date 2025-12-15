import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App
      username="สมชาย ทดสอบ"
      userId="DEV-999"
      role="Developer (Standalone Mode)"
    />
  </StrictMode>,
)

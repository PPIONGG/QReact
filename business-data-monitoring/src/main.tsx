import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import thTH from 'antd/locale/th_TH'
import './index.css'
import App from './App'

// BrowserRouter อยู่ที่นี่สำหรับ standalone dev mode
// เมื่อใช้เป็น remote module, host app จะมี Router ของตัวเองอยู่แล้ว
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider locale={thTH}>
      <BrowserRouter>
        <App username="DEV User" />
      </BrowserRouter>
    </ConfigProvider>
  </StrictMode>,
)

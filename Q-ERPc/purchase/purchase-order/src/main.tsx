import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import dayjs from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
import localeData from 'dayjs/plugin/localeData'
import 'dayjs/locale/th'
import './index.css'
import App from './App.tsx'

// Extend dayjs with plugins required by antd DatePicker
dayjs.extend(weekday)
dayjs.extend(localeData)
dayjs.locale('th')

// BrowserRouter อยู่ที่นี่สำหรับ standalone dev mode
// เมื่อใช้เป็น remote module, host app จะมี Router ของตัวเองอยู่แล้ว
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App
        username="สมชาย ทดสอบ"
        accessToken="DEV-TOKEN-999"
        permission={{
          user: "DEV-999",
          companys: [
            {
              companyCode: "DEV",
              companyName: "Developer Company",
              allPermission: true,
              moduleCodes: ["PURCHASE"]
            }
          ]
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)

import { Routes, Route, Navigate } from 'react-router-dom'
import { FinancialReport } from './pages/FinancialReport'
import { Inventory } from './pages/Inventory'
import { PurchaseSummary } from './pages/PurchaseSummary'
import { SalesSummary } from './pages/SalesSummary'

interface AppProps {
  username?: string
  accessToken?: string
  companyCode?: string
}

function App(_props: AppProps) {
  return (
    <Routes>
      <Route index element={<Navigate to="financial-report" replace />} />
      <Route path="financial-report" element={<FinancialReport />} />
      <Route path="inventory" element={<Inventory />} />
      <Route path="purchase-summary" element={<PurchaseSummary />} />
      <Route path="sales-summary" element={<SalesSummary />} />
    </Routes>
  )
}

export default App

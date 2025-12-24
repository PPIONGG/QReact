import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from './stores'
import { VisitorList, VisitorForm } from './pages'
import type { Permission } from './types'
import './App.css'

interface AppProps {
  username?: string
  accessToken?: string
  companyCode?: string
  permission?: Permission | null
}

interface SalesVisitorUIProps {
  canInsert?: boolean
  canEdit?: boolean
}

function SalesVisitorUI({ canInsert = true, canEdit = true }: SalesVisitorUIProps) {
  return (
    <div style={{ width: '100%' }}>
      <Routes>
        <Route index element={<VisitorList canInsert={canInsert} canEdit={canEdit} />} />
        <Route path="create" element={<VisitorForm canEdit={canInsert} />} />
        <Route path="edit/:id" element={<VisitorForm canEdit={canEdit} />} />
      </Routes>
    </div>
  )
}

function App({ username, accessToken, companyCode, permission }: AppProps) {
  const { setAuth, canInsert, canEdit } = useAuthStore()

  // Sync props from Portal to authStore
  useEffect(() => {
    if (username || accessToken || companyCode || permission) {
      setAuth({
        username: username || '',
        accessToken: accessToken || '',
        companyCode: companyCode || '',
        permission: permission || null,
      })
    }
  }, [username, accessToken, companyCode, permission, setAuth])

  // TODO: Fetch action permission from QERPcMenuActionJWT API
  // Similar to PO module

  return <SalesVisitorUI canInsert={canInsert} canEdit={canEdit} />
}

export default App

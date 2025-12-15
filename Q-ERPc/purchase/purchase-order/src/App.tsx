import { useEffect, useRef } from 'react'
import { Card, Typography, Spin, Flex } from 'antd'
import { Routes, Route } from 'react-router-dom'
import { PermissionProvider } from './contexts'
import { usePermission } from './hooks'
import { POList, POForm } from './pages'
import { useAuthStore } from './stores'
import type { Permission } from './types'

const { Text } = Typography

const MODULE_CODE = 'PO'

interface AppProps {
  username?: string
  /** Access token from QERPcMenuJWT (for calling QERPcMenuActionJWT) */
  accessToken?: string
  /** Company code for API header */
  companyCode?: string
  permission?: Permission | null
}

/** Inner component that uses permission context and syncs to store */
function PurchaseOrderContent() {
  const { actionPermission, actionAccessToken, isLoading, error, canInsert, canEdit } =
    usePermission()
  const setActionPermission = useAuthStore((state) => state.setActionPermission)
  const prevActionPermissionRef = useRef<string | null>(null)

  // Sync action permission to store (only when actually changed)
  useEffect(() => {
    if (actionPermission) {
      const permissionKey = JSON.stringify(actionPermission) + actionAccessToken
      if (prevActionPermissionRef.current !== permissionKey) {
        prevActionPermissionRef.current = permissionKey
        setActionPermission(actionPermission, actionAccessToken)
      }
    }
  }, [actionPermission, actionAccessToken, setActionPermission])

  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ height: '200px' }}>
        <Spin size="large" tip="กำลังโหลดสิทธิ์การใช้งาน..." />
      </Flex>
    )
  }

  if (error) {
    return (
      <Card>
        <Text type="danger">เกิดข้อผิดพลาด: {error}</Text>
      </Card>
    )
  }

  return <PurchaseOrderUI canInsert={canInsert} canEdit={canEdit} />
}

/** UI component - ไม่ต้องส่ง props อีกต่อไป ใช้ store แทน */
interface PurchaseOrderUIProps {
  canInsert?: boolean
  canEdit?: boolean
}

function PurchaseOrderUI({ canInsert = true, canEdit = true }: PurchaseOrderUIProps) {
  return (
    <div style={{ width: '100%' }}>
      {/* Routes - ใช้ relative paths เพื่อรองรับ nested routing จาก host app */}
      <Routes>
        <Route index element={<POList canInsert={canInsert} canEdit={canEdit} />} />
        <Route path="create" element={<POForm canEdit={canInsert} />} />
        <Route path="edit/:id" element={<POForm canEdit={canEdit} />} />
      </Routes>
    </div>
  )
}

/** Main App component with PermissionProvider */
function App({ username, accessToken, companyCode, permission }: AppProps = {}) {
  const setAuth = useAuthStore((state) => state.setAuth)
  const prevAuthRef = useRef<string | null>(null)

  // Sync props to store on mount and when props change (only when actually changed)
  useEffect(() => {
    const authKey = `${username}|${accessToken}|${companyCode}|${JSON.stringify(permission)}`
    if (prevAuthRef.current !== authKey) {
      prevAuthRef.current = authKey
      setAuth({
        username,
        accessToken,
        companyCode,
        permission,
      })
    }
  }, [username, accessToken, companyCode, permission, setAuth])

  // If no accessToken or companyCode, show basic UI without permission features
  if (!accessToken || !companyCode) {
    return <PurchaseOrderUI />
  }

  return (
    <PermissionProvider
      moduleCode={MODULE_CODE}
      accessToken={accessToken}
      companyCode={companyCode}
      permission={permission}
    >
      <PurchaseOrderContent />
    </PermissionProvider>
  )
}

export default App

import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Spin, Flex } from 'antd'
import { useAuth } from '../hooks/useAuth'
import { hasMenuPermission } from '../constants/moduleMapping'
import { authService } from '../services/authService'

interface RouteGuardProps {
  children: React.ReactNode
  menuKey: string
}

/**
 * Route Guard component to check if user has permission to access a route
 * Step 1: Check basic permission from LoginJWT (for menu display)
 * Step 2: Call QERPcMenuJWT to verify detailed access permission
 */
export function RouteGuard({ children, menuKey }: RouteGuardProps) {
  const { permission, menuPermission, updateCompany } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    async function checkPermission() {
      setIsLoading(true)

      const firstCompany = permission?.companys?.[0]
      if (!firstCompany) {
        setHasAccess(false)
        setIsLoading(false)
        return
      }

      // Step 1: Check parent menu permission from LoginJWT
      // Extract parent key from menuKey (e.g., 'purchase/purchase-order' -> 'purchase')
      const parentKey = menuKey.includes('/') ? menuKey.split('/')[0] : menuKey

      const hasParentPermission = hasMenuPermission(
        parentKey,
        firstCompany.moduleCodes,
        firstCompany.allPermission
      )

      // If parent menu not accessible, deny immediately
      if (!hasParentPermission) {
        console.log('RouteGuard - No parent permission for:', parentKey)
        setHasAccess(false)
        setIsLoading(false)
        return
      }

      // Step 2: For child routes, check detailed permission from QERPcMenuJWT
      if (menuKey.includes('/')) {
        try {
          // Ensure menuPermission is loaded
          if (!menuPermission || menuPermission.companyCode !== firstCompany.companyCode) {
            await updateCompany(firstCompany.companyCode)
          }

          const detailedPermission = menuPermission || (await authService.getMenuJWT(firstCompany.companyCode)).result?.permission

          if (detailedPermission) {
            const hasDetailedAccess = hasMenuPermission(
              menuKey,
              detailedPermission.moduleCodes,
              detailedPermission.allPermission
            )
            console.log('RouteGuard - Detailed check for:', menuKey, '-> hasAccess:', hasDetailedAccess)
            setHasAccess(hasDetailedAccess)
          } else {
            setHasAccess(false)
          }
        } catch (error) {
          console.error('RouteGuard - Failed to check permission:', error)
          setHasAccess(false)
        }
      } else {
        // For parent routes (no '/'), LoginJWT permission is enough
        setHasAccess(true)
      }

      setIsLoading(false)
    }

    checkPermission()
  }, [menuKey, permission, menuPermission, updateCompany])

  // Show loading while checking permission
  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ height: '50vh' }}>
        <Spin size="large" tip="กำลังตรวจสอบสิทธิ์..." />
      </Flex>
    )
  }

  // If no permission, redirect to unauthorized page
  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />
  }

  // User has permission, render the children
  return <>{children}</>
}

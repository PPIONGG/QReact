import { createContext, useState, useEffect, useRef, type ReactNode } from 'react'
import type { ActionPermission, Permission } from '../types'
import { permissionService } from '../services'

interface PermissionState {
  /** Action permission from QERPcMenuActionJWT (insert, edit, modify, print, options) */
  actionPermission: ActionPermission | null
  /** New access token from QERPcMenuActionJWT for future API calls */
  actionAccessToken: string | null
  /** Loading state */
  isLoading: boolean
  /** Error message if any */
  error: string | null
}

interface PermissionContextValue extends PermissionState {
  /** Check if user can insert */
  canInsert: boolean
  /** Check if user can edit */
  canEdit: boolean
  /** Check if user can modify */
  canModify: boolean
  /** Check if user can print */
  canPrint: boolean
  /** Check if user has a specific option */
  hasOption: (option: string) => boolean
}

export const PermissionContext = createContext<PermissionContextValue | null>(null)

interface PermissionProviderProps {
  children: ReactNode
  /** Module code (e.g., 'PO') */
  moduleCode: string
  /** Access token from QERPcMenuJWT (passed from Portal) */
  accessToken: string
  /** Company code for API header */
  companyCode: string
  /** Basic permission from LoginJWT */
  permission?: Permission | null
}

export function PermissionProvider({
  children,
  moduleCode,
  accessToken,
  companyCode,
}: PermissionProviderProps) {
  const [state, setState] = useState<PermissionState>({
    actionPermission: null,
    actionAccessToken: null,
    isLoading: true,
    error: null,
  })
  // Track last fetched params to detect changes
  const lastFetchedParams = useRef<string>('')

  useEffect(() => {
    const currentParams = `${moduleCode}:${companyCode}:${accessToken?.substring(0, 20)}`

    // Skip if same params (prevents duplicate calls from StrictMode)
    if (lastFetchedParams.current === currentParams) {
      return
    }

    async function fetchActionPermission() {
      if (!accessToken || !companyCode || !moduleCode) {
        console.log('🟡 PermissionContext - Missing required params:', { accessToken: !!accessToken, companyCode, moduleCode })
        setState((prev) => ({ ...prev, isLoading: false }))
        return
      }

      // Mark as fetching with current params
      lastFetchedParams.current = currentParams
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        console.log(`🔵 PermissionContext - Fetching action permission for module: ${moduleCode}`)
        console.log(`🔵 PermissionContext - Using companyCode: ${companyCode}`)
        console.log(`🔵 PermissionContext - Token prefix: ${accessToken.substring(0, 20)}...`)

        const response = await permissionService.getActionPermission(
          moduleCode,
          accessToken,
          companyCode
        )

        if (response.code === 0 && response.result) {
          console.log('✅ PermissionContext - Action permission loaded:', response.result.permission)
          console.log('✅ PermissionContext - New access token received')
          setState({
            actionPermission: response.result.permission,
            actionAccessToken: response.result.accessToken,
            isLoading: false,
            error: null,
          })
        } else {
          console.error('❌ PermissionContext - API error:', response.msg)
          setState({
            actionPermission: null,
            actionAccessToken: null,
            isLoading: false,
            error: response.msg || 'Failed to get action permission',
          })
        }
      } catch (error) {
        console.error('❌ PermissionContext - Fetch error:', error)
        setState({
          actionPermission: null,
          actionAccessToken: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    fetchActionPermission()
  }, [moduleCode, accessToken, companyCode])

  const value: PermissionContextValue = {
    ...state,
    canInsert: state.actionPermission?.insert === 'Y',
    canEdit: state.actionPermission?.edit === 'Y',
    canModify: state.actionPermission?.modify === 'Y',
    canPrint: state.actionPermission?.print === 'Y',
    hasOption: (option: string) => state.actionPermission?.options.includes(option) ?? false,
  }

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  )
}

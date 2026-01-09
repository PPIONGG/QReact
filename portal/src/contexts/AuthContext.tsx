import { useState, type ReactNode } from 'react'
import { authService } from '../services/authService'
import { AUTH_STORAGE_KEYS } from '../constants/auth'
import { AuthContext, type AuthState } from './authTypes'
import type { LoginType } from '../types/auth'

// Initialize auth state from localStorage (runs once)
function getInitialAuthState(): AuthState {
  const token = authService.getToken()
  const permission = authService.getPermission()
  const menuPermission = authService.getMenuPermission()
  const username = localStorage.getItem(AUTH_STORAGE_KEYS.USERNAME)

  if (token) {
    return {
      isAuthenticated: true,
      username,
      accessToken: token,
      permission,
      menuPermission,
    }
  }

  return {
    isAuthenticated: false,
    username: null,
    accessToken: null,
    permission: null,
    menuPermission: null,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(getInitialAuthState)

  const login = async (loginType: LoginType, username: string, password: string) => {
    try {
      const response = await authService.login(loginType, username, password)

      if (response.code === 0) {
        localStorage.setItem(AUTH_STORAGE_KEYS.USERNAME, username)

        // Get first company code to call QERPcMenuJWT
        const firstCompany = response.result.permission.companys[0]

        // Call QERPcMenuJWT immediately after login
        let menuPermission = null
        let menuAccessToken = response.result.accessToken // Default to LoginJWT token
        if (firstCompany) {
          try {
            const menuResponse = await authService.getMenuJWT(firstCompany.companyCode)
            if (menuResponse.code === 0 && menuResponse.result) {
              menuPermission = menuResponse.result.permission
              menuAccessToken = menuResponse.result.accessToken // Use token from QERPcMenuJWT
            }
          } catch (error) {
            console.error('❌ AuthContext - Failed to get menu permission:', error)
          }
        }

        setState({
          isAuthenticated: true,
          username,
          accessToken: menuAccessToken, // Use token from QERPcMenuJWT for API calls
          permission: response.result.permission,
          menuPermission,
        })

        return { success: true }
      } else {
        return { success: false, message: response.msg || 'เข้าสู่ระบบไม่สำเร็จ' }
      }
    } catch {
      return { success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' }
    }
  }

  const logout = () => {
    authService.logout()

    // Dispatch custom event for micro-frontends to reset their stores
    window.dispatchEvent(new CustomEvent('qerp:logout'))

    setState({
      isAuthenticated: false,
      username: null,
      accessToken: null,
      permission: null,
      menuPermission: null,
    })
  }

  const updateCompany = async (companyCode: string) => {
    try {
      const menuResponse = await authService.getMenuJWT(companyCode)

      if (menuResponse.code === 0 && menuResponse.result) {
        setState({
          ...state,
          accessToken: menuResponse.result.accessToken,
          menuPermission: menuResponse.result.permission,
        })
      }
    } catch (error) {
      console.error('Failed to update company:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateCompany }}>
      {children}
    </AuthContext.Provider>
  )
}

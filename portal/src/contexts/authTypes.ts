import { createContext } from 'react'
import type { ResLoginJWT, ResMenuJWT, LoginType } from '../types/auth'

export interface AuthState {
  isAuthenticated: boolean
  username: string | null
  accessToken: string | null
  permission: ResLoginJWT['permission'] | null
  menuPermission: ResMenuJWT['permission'] | null
}

export interface AuthContextType extends AuthState {
  login: (loginType: LoginType, username: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  updateCompany: (companyCode: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

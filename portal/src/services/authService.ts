import { httpClient } from './httpClient'
import { AUTH_STORAGE_KEYS } from '../constants/auth'
import type {
  ApiJWTResponse,
  ResLoginJWT,
  ResMenuJWT,
  LoginType,
  LoginRequest,
} from '../types/auth'

export const authService = {
  async login(
    loginType: LoginType,
    username: string,
    password: string
  ): Promise<ApiJWTResponse<ResLoginJWT>> {
    const payload: LoginRequest = {
      QERPUserOrDBUser: loginType,
      UserLogin: username,
      Password: password,
    }

    const response = await httpClient.post<ApiJWTResponse<ResLoginJWT>>(
      '/api/Login/LoginJWT',
      payload
    )

    if (response.code === 0 && response.result?.accessToken) {
      this.setToken(response.result.accessToken)
      this.setPermission(response.result.permission)
    }

    return response
  },

  setToken(token: string): void {
    localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, token)
  },

  getToken(): string | null {
    return localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
  },

  setPermission(permission: ResLoginJWT['permission']): void {
    localStorage.setItem(AUTH_STORAGE_KEYS.PERMISSION, JSON.stringify(permission))
  },

  getPermission(): ResLoginJWT['permission'] | null {
    const data = localStorage.getItem(AUTH_STORAGE_KEYS.PERMISSION)
    return data ? JSON.parse(data) : null
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(AUTH_STORAGE_KEYS.PERMISSION)
    localStorage.removeItem(AUTH_STORAGE_KEYS.USERNAME)
  },

  async getMenuJWT(companyCode: string): Promise<ApiJWTResponse<ResMenuJWT>> {

    // Get current token to send with request
    const currentToken = this.getToken()

    // Try POST instead of GET (API may require POST method)
    const response = await httpClient.post<ApiJWTResponse<ResMenuJWT>>(
      '/api/JWT/QERPcMenuJWT',
      {}, // Empty body
      {
        accessToken: currentToken || undefined,
        packageCode: companyCode, // Send as X-PACKAGE header
      }
    )


    if (response.code === 0 && response.result?.accessToken) {
      this.setToken(response.result.accessToken)
      // Store the menu permission separately
      localStorage.setItem(AUTH_STORAGE_KEYS.MENU_PERMISSION, JSON.stringify(response.result.permission))
    }

    return response
  },

  getMenuPermission(): ResMenuJWT['permission'] | null {
    const data = localStorage.getItem(AUTH_STORAGE_KEYS.MENU_PERMISSION)
    return data ? JSON.parse(data) : null
  },
}

export default authService

/** Standard API response wrapper */
export interface ApiResponse<T> {
  code: number
  msg: string | null
  result: T | null
}

/** Paginated API response wrapper */
export interface PaginatedApiResponse<T> {
  code: number
  msg: string | null
  result: T | null
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

/** Company info from LoginJWT */
export interface Company {
  companyCode: string
  companyName: string
  allPermission: boolean
  moduleCodes: string[]
}

/** Permission from LoginJWT */
export interface Permission {
  user: string
  companys: Company[]
}

/** Menu permission from QERPcMenuJWT */
export interface MenuPermission {
  companyCode: string
  companyName: string
  allPermission: boolean
  moduleCodes: string[]
}

/** Action permission from QERPcMenuActionJWT */
export interface ActionPermission {
  moduleCode: string
  insert: 'Y' | 'N'
  edit: 'Y' | 'N'
  modify: 'Y' | 'N'
  print: 'Y' | 'N'
  options: string[]
}

/** Login response */
export interface LoginResult {
  accessToken: string
  permission: Permission
}

/** Menu JWT response */
export interface MenuJWTResult {
  accessToken: string
  permission: MenuPermission
}

/** Action JWT response */
export interface ActionJWTResult {
  accessToken: string
  permission: ActionPermission
}

/** Login request payload */
export interface LoginRequest {
  QERPUserOrDBUser: 'Q' | 'DB'
  UserLogin: string
  Password: string
}

/** Login type */
export type LoginType = 'Q' | 'DB'

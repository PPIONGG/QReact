/**
 * Action permission from QERPcMenuActionJWT API
 * Controls what actions user can perform in this module
 */
export interface ActionPermission {
  moduleCode: string
  insert: 'Y' | 'N'
  edit: 'Y' | 'N'
  modify: 'Y' | 'N'
  print: 'Y' | 'N'
  options: string[]
}

/**
 * Response from QERPcMenuActionJWT API
 */
export interface ActionPermissionResponse {
  code: number
  msg: string | null
  result: {
    accessToken: string
    permission: ActionPermission
  } | null
}

/**
 * Company info from LoginJWT
 */
export interface Company {
  companyCode: string
  companyName: string
  allPermission: boolean
  moduleCodes: string[]
}

/**
 * Permission from LoginJWT
 */
export interface Permission {
  user: string
  companys: Company[]
}

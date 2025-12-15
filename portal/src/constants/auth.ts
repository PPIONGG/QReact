import type { LoginType } from '../types/auth'

export const LOGIN_TYPE_OPTIONS = [
  { label: 'QERP (Q)', value: 'Q' as LoginType },
  { label: 'DB', value: 'DB' as LoginType },
] as const

export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  PERMISSION: 'permission',
  MENU_PERMISSION: 'menuPermission',
  USERNAME: 'username',
} as const

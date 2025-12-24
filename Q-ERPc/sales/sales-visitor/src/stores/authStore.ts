import { create } from 'zustand'
import type { Permission, ActionPermission } from '../types'

interface AuthState {
  // User info
  username: string
  accessToken: string
  companyCode: string
  permission: Permission | null

  // Action permission (from QERPcMenuActionJWT)
  actionPermission: ActionPermission | null
  actionAccessToken: string | null

  // Permission flags
  canInsert: boolean
  canEdit: boolean
  canPrint: boolean

  // Actions
  setAuth: (auth: {
    username?: string
    accessToken?: string
    companyCode?: string
    permission?: Permission | null
  }) => void
  setActionPermission: (
    actionPermission: ActionPermission | null,
    actionAccessToken?: string | null
  ) => void
  reset: () => void
}

const initialState = {
  username: '',
  accessToken: '',
  companyCode: '',
  permission: null,
  actionPermission: null,
  actionAccessToken: null,
  canInsert: false,
  canEdit: false,
  canPrint: false,
}

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,

  setAuth: (auth) =>
    set((state) => ({
      ...state,
      username: auth.username ?? state.username,
      accessToken: auth.accessToken ?? state.accessToken,
      companyCode: auth.companyCode ?? state.companyCode,
      permission: auth.permission !== undefined ? auth.permission : state.permission,
    })),

  setActionPermission: (actionPermission, actionAccessToken) =>
    set({
      actionPermission,
      actionAccessToken: actionAccessToken ?? null,
      canInsert: actionPermission?.insert === 'Y',
      canEdit: actionPermission?.edit === 'Y',
      canPrint: actionPermission?.print === 'Y',
    }),

  reset: () => set(initialState),
}))

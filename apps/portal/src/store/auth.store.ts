import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '../types/auth.types';
import { SESSION_DURATION } from '../constants/auth.constants';
import { loginAPI, getErrorMessage } from './../api/auth.api';
import { API_CONFIG } from '../api/config';

// Auth Store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      selectedCompanyCode: null,

      // Set Selected Company
      setSelectedCompany: (code: string) => {
        set({ selectedCompanyCode: code });
      },

      // Clear Error
      clearError: () => {
        set({ error: null });
      },

      // Login
      login: async (
        username: string,
        password: string,
        loginType: 'Q' | 'DB'
      ): Promise<boolean> => {
        set({ isLoading: true, error: null });

        try {
          const response = await loginAPI(
            API_CONFIG,
            username,
            password,
            loginType
          );

          if (response.code === 0 && response.result) {
            // Success
            const user: User = {
              username: response.result.user,
              loginTime: Date.now(),
              company: response.result.company,
            };

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              selectedCompanyCode:
                response.result.company[0]?.companyCode || null,
            });

            return true;
          } else {
            // Login failed
            set({
              isLoading: false,
              error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
            });
            return false;
          }
        } catch (error) {
          set({
            isLoading: false,
            error: getErrorMessage(error),
          });
          return false;
        }
      },

      // Logout
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          selectedCompanyCode: null,
        });
      },
    }),
    {
      name: 'auth-storage',
      version: 1,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        selectedCompanyCode: state.selectedCompanyCode,
      }),
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return {
            user: null,
            isAuthenticated: false,
          };
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          const isExpired =
            Date.now() - state.user.loginTime > SESSION_DURATION;
          if (isExpired) {
            state.logout();
          }
        }
      },
    }
  )
);

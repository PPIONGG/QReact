import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '../types/auth.types';
import { getErrorMessage, loginAPI } from '../../api/auth.api';
import { API_CONFIG } from '../../api/config';


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
    }
  )
);

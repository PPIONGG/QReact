import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AuthState, User } from './auth.types';
import { API_CONFIG } from './config';
import { getErrorMessage, getSalesInfoAPI, loginAPI } from './auth.api';

// Auth Store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      isAuthenticated: false,
      isLoadingLogin: false,
      errorLogin: null,
      selectedCompanyCode: null,
      Salesinfo: null,
      isloadingSalesinfo: false,
      errorSalesinfo: null,

      setSelectedCompany: (code: string) => {
        set({ selectedCompanyCode: code });
      },

      clearErrorLogin: () => {
        set({ errorLogin: null });
      },

      // Login
      login: async (
        username: string,
        password: string,
        loginType: 'Q' | 'DB'
      ): Promise<boolean> => {
        set({ isLoadingLogin: true, errorLogin: null });

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
              isLoadingLogin: false,
              errorLogin: null,
              selectedCompanyCode:
                response.result.company[0]?.companyCode || null,
            });

            return true;
          } else {
            // Login failed
            set({
              isLoadingLogin: false,
              errorLogin: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
            });
            return false;
          }
        } catch (error) {
          set({
            isLoadingLogin: false,
            errorLogin: getErrorMessage(error),
          });
          return false;
        }
      },

      // Logout
      logout: () => {
        sessionStorage.removeItem('auth-storage');
        set({
          user: null,
          isAuthenticated: false,
          isLoadingLogin: false,
          errorLogin: null,
          selectedCompanyCode: null,
          Salesinfo: null,
          isloadingSalesinfo: false,
          errorSalesinfo: null,
        });
      },
      fetchSalesinfo: async (user: string) => {
        set({ isloadingSalesinfo: true, errorSalesinfo: null });

        try {
          const data = await getSalesInfoAPI(API_CONFIG, user);
          set({
            Salesinfo: data,
            isloadingSalesinfo: false,
            errorSalesinfo: null,
          });
        } catch (error) {
          set({
            isloadingSalesinfo: false,
            errorSalesinfo:
              error instanceof Error ? error.message : 'An error occurred',
            Salesinfo: null,
          });
        }
      },
      clearSalesinfo: () => set({ Salesinfo: null, errorSalesinfo: null }),
      clearErrorSalesinfo: () => set({ errorSalesinfo: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage), // เพิ่มบรรทัดนี้เพื่อใช้ sessionStorage
      version: 1,
    }
  )
);

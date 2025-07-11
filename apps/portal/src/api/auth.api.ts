import { ApiResponse } from '../app/types/auth.types';
import { ApiConfig } from './config';

// API Configuration
const createHeaders = (config: ApiConfig) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${config.token}`,
  'X-API-Package': config.package,
});

// Login API
export const loginAPI = async (
  config: ApiConfig,
  username: string,
  password: string,
  loginType: 'Q' | 'DB'
): Promise<ApiResponse> => {
  const response = await fetch(`${config.baseUrl}/api/Login`, {
    method: 'POST',
    headers: createHeaders(config),
    body: JSON.stringify({
      QERPUserOrDBUser: loginType,
      UserLogin: username,
      Password: password,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = (await response.json()) as ApiResponse;
  return data;
};

// Error Handler
export const getErrorMessage = (error: any): string => {
  if (error?.message?.includes('Failed to fetch')) {
    return 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้';
  }
  if (error?.code === -1) {
    return 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้';
  }
  if (error?.msg) {
    return error.msg;
  }
  return 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
};

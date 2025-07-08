import type { ApiResponse } from '@qreact/types';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;
const API_PACKAGE = process.env.NEXT_PUBLIC_API_PACKAGE;

// Validation
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is required');
}
if (!API_TOKEN) {
  throw new Error('NEXT_PUBLIC_API_TOKEN is required');
}
if (!API_PACKAGE) {
  throw new Error('NEXT_PUBLIC_API_PACKAGE is required');
}

// API Configuration
const createHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${API_TOKEN}`,
  'X-API-Package': API_PACKAGE,
});

// Login API
export const loginAPI = async (
  username: string,
  password: string,
  loginType: 'Q' | 'DB'
): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/Login`, {
    method: 'POST',
    headers: createHeaders(),
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
import { ResSalesinfo } from '../types/api';
import { ResLogin } from '../types/auth.types';
import type { ApiConfig } from './config';

// API Configuration
const createHeaders = (config: ApiConfig) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.token}`,
    'X-PACKAGE': config.package,
  };
  
  // เพิ่ม ngrok header เฉพาะตอน development
  if (config.baseUrl.includes('ngrok')) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }
  
  return headers;
};

export const loginAPI = async (
  config: ApiConfig,
  username: string,
  password: string,
  loginType: 'Q' | 'DB'
): Promise<ResLogin> => {
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
    if (response.status === 400) {     
    const errorData = (await response.json()) as ResLogin
    return errorData;
    }
    throw new Error(`HTTP ${response.status}`);
  }

  const data = (await response.json()) as ResLogin;
  return data;
};

export const getSalesInfoAPI = async (
  config: ApiConfig,
  user: string
): Promise<ResSalesinfo> => {
  
  const response = await fetch(
    `${config.baseUrl}/api/Employee/salesinfo/${user}`,
    {
      method: 'GET',
      headers: createHeaders(config),
    }
  );

  if (!response.ok) {
    if (response.status === 400) {      
    const errorData = (await response.json()) as ResSalesinfo
    return errorData;
    }
    throw new Error(`HTTP ${response.status}`);
  }
  

  const data = (await response.json()) as ResSalesinfo;

  return data;
};

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

export interface ApiConfig {
  baseUrl: string;
  token: string;
  package: string;
}

// api config สำหรับการเชื่อมต่อกับ API ของระบบ
const createApiConfig = (): ApiConfig => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = import.meta.env.VITE_API_TOKEN;
  const packageName = import.meta.env.VITE_API_PACKAGE;

  // Validation
  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL is required in environment variables');
  }
  if (!token) {
    throw new Error('VITE_API_TOKEN is required in environment variables');
  }
  if (!packageName) {
    throw new Error('VITE_API_PACKAGE is required in environment variables');
  }

  return {
    baseUrl,
    token,
    package: packageName,
  };
};

export const API_CONFIG = createApiConfig();
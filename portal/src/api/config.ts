// ประกาศ global constants จาก webpack
declare const __API_BASE_URL__: string;
declare const __API_TOKEN__: string;
declare const __API_PACKAGE__: string;

export interface ApiConfig {
  baseUrl: string;
  token: string;
  package: string;
}

// api config สำหรับการเชื่อมต่อกับ API ของระบบ
const createApiConfig = (): ApiConfig => {
  const baseUrl = __API_BASE_URL__;
  const token = __API_TOKEN__;
  const packageName = __API_PACKAGE__;

  // Validation
  if (!baseUrl) {
    throw new Error('API_BASE_URL is required in environment variables');
  }
  if (!token) {
    throw new Error('API_TOKEN is required in environment variables');
  }
  if (!packageName) {
    throw new Error('API_PACKAGE is required in environment variables');
  }

  return {
    baseUrl,
    token,
    package: packageName,
  };
};

export const API_CONFIG = createApiConfig();
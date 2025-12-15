import { HttpClient, createHttpClient } from '@qerp/shared/services'
import type { ApiConfig, RequestOptions } from '@qerp/shared/services'

// Re-export types from shared
export type { ApiConfig, RequestOptions }
export { HttpClient }

// Create httpClient instance with environment config
export const httpClient = createHttpClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL || '',
  defaultToken: import.meta.env.VITE_API_TOKEN_BEARER || '',
  defaultPackage: import.meta.env.VITE_API_DEFAULT_PACKAGE || '',
})

export default HttpClient

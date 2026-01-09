import axios, { type AxiosInstance, type AxiosError } from 'axios'

export interface ApiConfig {
  baseUrl: string
  defaultToken?: string
  defaultPackage?: string
  timeout?: number
}

export interface RequestOptions {
  accessToken?: string
  packageCode?: string
  params?: Record<string, string | number | boolean>
}

export class HttpClient {
  private axiosInstance: AxiosInstance
  private defaultToken: string
  private defaultPackage: string

  constructor(config: ApiConfig) {
    this.defaultToken = config.defaultToken || ''
    this.defaultPackage = config.defaultPackage || ''

    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response
      },
      (error: AxiosError) => {
        if (error.response) {
          console.error('❌ API Error:', error.response.status, error.response.data)
        } else if (error.request) {
          console.error('❌ Network Error:', error.message)
        } else {
          console.error('❌ Error:', error.message)
        }
        return Promise.reject(error)
      }
    )
  }

  private createHeaders(options?: RequestOptions): Record<string, string> {
    const headers: Record<string, string> = {}

    const token = options?.accessToken || this.defaultToken
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const packageCode = options?.packageCode || this.defaultPackage
    if (packageCode) {
      headers['X-PACKAGE'] = packageCode
    }

    return headers
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const response = await this.axiosInstance.get<T>(endpoint, {
      headers: this.createHeaders(options),
      params: options?.params,
    })
    return response.data
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const response = await this.axiosInstance.post<T>(endpoint, body, {
      headers: this.createHeaders(options),
    })
    return response.data
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const response = await this.axiosInstance.put<T>(endpoint, body, {
      headers: this.createHeaders(options),
    })
    return response.data
  }

  async patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const response = await this.axiosInstance.patch<T>(endpoint, body, {
      headers: this.createHeaders(options),
    })
    return response.data
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const response = await this.axiosInstance.delete<T>(endpoint, {
      headers: this.createHeaders(options),
    })
    return response.data
  }

  async postBlob(endpoint: string, body?: unknown, options?: RequestOptions): Promise<Blob> {
    const response = await this.axiosInstance.post(endpoint, body, {
      headers: this.createHeaders(options),
      responseType: 'blob',
    })
    return response.data
  }

  /** Update default token (e.g., after login) */
  setDefaultToken(token: string) {
    this.defaultToken = token
  }

  /** Update default package code (e.g., after company change) */
  setDefaultPackage(packageCode: string) {
    this.defaultPackage = packageCode
  }
}

/** Factory function to create HttpClient with environment config */
export function createHttpClient(config?: Partial<ApiConfig>): HttpClient {
  return new HttpClient({
    baseUrl: config?.baseUrl || '',
    defaultToken: config?.defaultToken || '',
    defaultPackage: config?.defaultPackage || '',
    timeout: config?.timeout || 30000,
  })
}

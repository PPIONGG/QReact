/**
 * Standard API response format
 */
export interface ApiResponse<T> {
  code: number
  msg: string | null
  result: T | null
}

/**
 * Paginated response format
 */
export interface PaginatedResponse<T> {
  code: number
  msg: string | null
  result: {
    items: T[]
    totalCount: number
    pageSize: number
    currentPage: number
  } | null
}

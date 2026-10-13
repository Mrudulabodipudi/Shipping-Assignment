export interface SelectOption<T = string | number> {
  value: T
  label: string
  sublabel?: string
  description?: string
  disabled?: boolean
}

export interface SchemeCodeDefinition {
  value: string
  label: string
  description?: string
  drawback?: boolean
  RODTEP?: boolean
  ROSCTL?: boolean
  category?: string
}

export interface DocumentCodeOption {
  value: string
  label: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  timestamp: string
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

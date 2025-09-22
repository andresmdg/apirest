export interface User {
  id: number
  name: string
  email: string
}

export interface CreateUserDto {
  name: string
  email: string
}

export interface UpdateUserDto {
  name?: string
  email?: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  error?: string
}

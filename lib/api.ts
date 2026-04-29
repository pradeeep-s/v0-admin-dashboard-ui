'use client'

const API_BASE = typeof window !== 'undefined' ? '' : process.env.API_URL || ''

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    })

    const data = await response.json() as ApiResponse<T>

    if (!response.ok) {
      // Handle 401 unauthorized - redirect to login
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }

      throw new ApiError(
        data.message || 'An error occurred',
        response.status,
        data
      )
    }

    return data.data as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    if (error instanceof SyntaxError) {
      throw new ApiError('Invalid response format', 500)
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'An unknown error occurred',
      500
    )
  }
}

// Convenience methods
export const api = {
  get<T>(endpoint: string) {
    return apiCall<T>(endpoint, { method: 'GET' })
  },

  post<T>(endpoint: string, body?: any) {
    return apiCall<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  },

  put<T>(endpoint: string, body?: any) {
    return apiCall<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  },

  delete<T>(endpoint: string) {
    return apiCall<T>(endpoint, { method: 'DELETE' })
  },

  patch<T>(endpoint: string, body?: any) {
    return apiCall<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  },
}

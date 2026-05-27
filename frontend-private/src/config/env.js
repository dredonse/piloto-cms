export const PUBLIC_APP_URL =
  import.meta.env.VITE_PUBLIC_APP_URL || 'http://localhost:5174'

export const APP_ENV = import.meta.env.VITE_APP_ENV || 'production'
export const IS_DEVELOPMENT = APP_ENV === 'development'

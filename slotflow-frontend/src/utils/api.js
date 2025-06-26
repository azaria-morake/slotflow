import axios from 'axios'
import { toast } from 'react-toastify'
import { getToken, removeToken } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
})


// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle token expiration
      if (error.response.status === 401) {
        removeToken()
        window.location.href = '/login'
        toast.error('Session expired. Please log in again.')
      }
      
      // Handle other errors
      const message = error.response.data?.detail || 
                     error.response.data?.message || 
                     'An error occurred'
      toast.error(message)
    }
    return Promise.reject(error)
  }
)

export default api
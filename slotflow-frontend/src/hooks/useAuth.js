import { useState, useEffect } from 'react'
import { getUserFromToken } from '../utils/auth'
import api from '../utils/api'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const userData = getUserFromToken()
      if (userData) {
        try {
          // Verify token is still valid
          await api.get('/auth/me/')
          setUser(userData)
        } catch (error) {
          console.error('Authentication error:', error)
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/token/', credentials)
      localStorage.setItem('slotflow_token', response.data.access)
      const userData = getUserFromToken()
      setUser(userData)
      return userData
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('slotflow_token')
    setUser(null)
  }

  return { user, isLoading, login, logout }
}
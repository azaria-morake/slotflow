import { useState } from 'react'
import api from '../utils/api'

export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const makeRequest = async (method, url, data = null, config = {}) => {
    setIsLoading(true)
    setError(null)
    
    try {
      let response
      switch (method.toLowerCase()) {
        case 'get':
          response = await api.get(url, config)
          break
        case 'post':
          response = await api.post(url, data, config)
          break
        case 'put':
          response = await api.put(url, data, config)
          break
        case 'patch':
          response = await api.patch(url, data, config)
          break
        case 'delete':
          response = await api.delete(url, config)
          break
        default:
          throw new Error(`Unsupported HTTP method: ${method}`)
      }
      return response.data
    } catch (error) {
      setError(error.response?.data || { detail: 'An error occurred' })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { isLoading, error, makeRequest }
}
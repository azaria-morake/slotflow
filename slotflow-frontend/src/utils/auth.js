import { jwtDecode } from 'jwt-decode' 

export const getToken = () => {
  return localStorage.getItem('slotflow_token')
}

export const setToken = (token) => {
  localStorage.setItem('slotflow_token', token)
}

export const removeToken = () => {
  localStorage.removeItem('slotflow_token')
}

export const getUserFromToken = () => {
  const token = getToken()
  if (!token) return null
  
  try {
    const decoded = jwtDecode(token)  // Changed from jwt_decode to jwtDecode
    return {
      id: decoded.user_id,
      username: decoded.username,
      email: decoded.email,
      is_admin: decoded.is_admin,
      is_learner: decoded.is_learner
    }
  } catch (error) {
    removeToken()
    return null
  }
}
import { Navigate, Outlet } from 'react-router-dom'
import { getUserFromToken } from '../../utils/auth'

const ProtectedRoute = () => {
  const user = getUserFromToken()
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute
import { Navigate, Outlet } from 'react-router-dom'
import { getUserFromToken } from '../../utils/auth'
import { toast } from 'react-toastify'

const RoleBasedRoute = ({ allowedRoles }) => {
  const user = getUserFromToken()
  
  if (!user) {
    toast.error('You need to log in first')
    return <Navigate to="/login" replace />
  }
  
  if (!allowedRoles.includes(user.is_admin ? 'admin' : 'learner')) {
    toast.error('You do not have permission to access this page')
    return <Navigate to="/" replace />
  }
  
  return <Outlet />
}

export default RoleBasedRoute
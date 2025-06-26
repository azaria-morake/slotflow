import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'bootstrap/dist/css/bootstrap.min.css'
import Welcome from './pages/Welcome'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import AdminDashboard from './pages/Dashboard/AdminDashboard'
import LearnerDashboard from './pages/Dashboard/LearnerDashboard'
import Profile from './pages/Profile'
import CourseDetail from './pages/Course/CourseDetail'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import RoleBasedRoute from './components/Auth/RoleBasedRoute'
import Navbar from './components/Common/Navbar'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          
          <Route element={<RoleBasedRoute allowedRoles={['admin']} />}>
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
          </Route>
          
          <Route element={<RoleBasedRoute allowedRoles={['learner']} />}>
            <Route path="/dashboard/learner" element={<LearnerDashboard />} />
          </Route>
        </Route>
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )
}

export default App
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Button } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { loginSchema } from '../../utils/validators'
import { useAuth } from '../../hooks/useAuth'
import FormInput from '../../components/Common/FormInput'
import api from '../../utils/api'
import { toast } from 'react-toastify'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(loginSchema)
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await api.post('/auth/token/', data)
      const user = await login(data)
      
      toast.success('Login successful')
      
      if (user.is_admin) {
        navigate('/dashboard/admin')
      } else {
        navigate('/dashboard/learner')
      }
    } catch (error) {
      toast.error('Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="form-container">
      <h2 className="text-center mb-4">Login</h2>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormInput
          label="Username or Email"
          name="username"
          register={register}
          errors={errors}
          placeholder="Enter your username or email"
        />
        
        <FormInput
          label="Password"
          name="password"
          type="password"
          register={register}
          errors={errors}
          placeholder="Enter your password"
        />
        
        <Button type="submit" variant="primary" className="w-100" isLoading={isLoading}>
          Login
        </Button>
      </Form>
      
      <div className="text-center mt-3">
        <p>
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  )
}

export default Login
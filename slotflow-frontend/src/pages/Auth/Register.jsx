import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Button } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { registerSchema } from '../../utils/validators'
import FormInput from '../../components/Common/FormInput'
import api from '../../utils/api'
import { toast } from 'react-toastify'

const Register = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(registerSchema)
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await api.post('/auth/register/', data)
      toast.success('Registration successful! Please log in.')
      navigate('/login')
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="form-container">
      <h2 className="text-center mb-4">Register</h2>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormInput
          label="Username"
          name="username"
          register={register}
          errors={errors}
          placeholder="Choose a username"
        />
        
        <FormInput
          label="Email"
          name="email"
          type="email"
          register={register}
          errors={errors}
          placeholder="Enter your email"
        />
        
        <FormInput
          label="Password"
          name="password"
          type="password"
          register={register}
          errors={errors}
          placeholder="Create a password"
        />
        
        <FormInput
          label="Confirm Password"
          name="password2"
          type="password"
          register={register}
          errors={errors}
          placeholder="Confirm your password"
        />
        
        <Form.Group className="mb-3">
          <Form.Label>Role</Form.Label>
          <Form.Select {...register('role')} isInvalid={!!errors.role}>
            <option value="">Select your role</option>
            <option value="admin">Admin</option>
            <option value="learner">Learner</option>
          </Form.Select>
          {errors.role && (
            <Form.Control.Feedback type="invalid">
              {errors.role.message}
            </Form.Control.Feedback>
          )}
        </Form.Group>
        
        <Button type="submit" variant="primary" className="w-100" isLoading={isLoading}>
          Register
        </Button>
      </Form>
      
      <div className="text-center mt-3">
        <p>
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  )
}

export default Register
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Container } from 'react-bootstrap'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import logo from '../assets/flow.png'

const Welcome = () => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingSpinner fullPage />
  }

  return (
    <Container className="text-center mt-5">
      <img src={logo} alt="SlotFlow Logo" style={{ height: '150px' }} className="mb-4" />
      <h1 className="mb-3">Welcome to SlotFlow</h1>
      <p className="lead mb-5">
        Book your trade-skills training courses with ease
      </p>
      
      <div className="d-grid gap-3 col-md-6 mx-auto">
        <Button as={Link} to="/login" variant="primary" size="lg">
          Login
        </Button>
        <Button as={Link} to="/register" variant="outline-secondary" size="lg">
          Register
        </Button>
      </div>
    </Container>
  )
}

export default Welcome
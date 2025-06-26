import { Navbar, Nav, Container, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { getUserFromToken, removeToken } from '../../utils/auth'
import { toast } from 'react-toastify'

const CustomNavbar = () => {
  const user = getUserFromToken()
  const navigate = useNavigate()

  const handleLogout = () => {
    removeToken()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">SlotFlow</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            {user?.is_admin && (
              <Nav.Link as={Link} to="/dashboard/admin">Admin Dashboard</Nav.Link>
            )}
            {user?.is_learner && (
              <Nav.Link as={Link} to="/dashboard/learner">Learner Dashboard</Nav.Link>
            )}
          </Nav>
          <Nav>
            {user ? (
              <>
                <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
                <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default CustomNavbar
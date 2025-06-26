import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getUserFromToken, removeToken } from '../../utils/auth'
import { toast } from 'react-toastify'
import './CustomNavbar.css'

const CustomNavbar = () => {
  const user = getUserFromToken()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    removeToken()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const isActiveLink = (path) => {
    return location.pathname === path
  }

  return (
    <Navbar 
      bg="primary" 
      variant="dark" 
      expand="lg" 
      className="mb-4 custom-navbar shadow-lg"
      fixed="top"
    >
      <Container>
        <Navbar.Brand 
          as={Link} 
          to="/" 
          className="brand-logo d-flex align-items-center"
        >
          <div className="logo-icon me-2">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <span className="brand-text">SlotFlow</span>
        </Navbar.Brand>
        
        <Navbar.Toggle 
          aria-controls="basic-navbar-nav" 
          className="custom-toggler"
        />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={`nav-link-custom ${isActiveLink('/') ? 'active' : ''}`}
            >
              <i className="fas fa-home me-1"></i>
              Home
            </Nav.Link>
            
            {user?.is_admin && (
              <Nav.Link 
                as={Link} 
                to="/dashboard/admin" 
                className={`nav-link-custom ${isActiveLink('/dashboard/admin') ? 'active' : ''}`}
              >
                <i className="fas fa-cog me-1"></i>
                Admin Dashboard
                <Badge bg="warning" className="ms-1">Admin</Badge>
              </Nav.Link>
            )}
            
            {user?.is_learner && (
              <Nav.Link 
                as={Link} 
                to="/dashboard/learner" 
                className={`nav-link-custom ${isActiveLink('/dashboard/learner') ? 'active' : ''}`}
              >
                <i className="fas fa-graduation-cap me-1"></i>
                Learner Dashboard
              </Nav.Link>
            )}
          </Nav>
          
          <Nav className="user-section">
            {user ? (
              <>
                <div className="user-info d-flex align-items-center me-3">
                  <div className="user-avatar me-2">
                    <i className="fas fa-user-circle"></i>
                  </div>
                  <span className="user-name text-light">
                    Welcome, {user.first_name || user.username}
                  </span>
                </div>
                
                <Nav.Link 
                  as={Link} 
                  to="/profile" 
                  className={`nav-link-custom ${isActiveLink('/profile') ? 'active' : ''}`}
                >
                  <i className="fas fa-user me-1"></i>
                  Profile
                </Nav.Link>
                
                <Button 
                  variant="outline-light" 
                  onClick={handleLogout}
                  className="logout-btn ms-2"
                  size="sm"
                >
                  <i className="fas fa-sign-out-alt me-1"></i>
                  Logout
                </Button>
              </>
            ) : (
              <div className="auth-links">
                <Nav.Link 
                  as={Link} 
                  to="/login" 
                  className={`nav-link-custom ${isActiveLink('/login') ? 'active' : ''}`}
                >
                  <i className="fas fa-sign-in-alt me-1"></i>
                  Login
                </Nav.Link>
                
                <Button 
                  as={Link} 
                  to="/register" 
                  variant="outline-light" 
                  className="register-btn ms-2"
                  size="sm"
                >
                  <i className="fas fa-user-plus me-1"></i>
                  Register
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default CustomNavbar
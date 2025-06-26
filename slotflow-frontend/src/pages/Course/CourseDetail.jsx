import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Button, Card, Badge, Row, Col } from 'react-bootstrap'
import api from '../../utils/api'
import { toast } from 'react-toastify'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import { useAuth } from '../../hooks/useAuth'

const CourseDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBooked, setIsBooked] = useState(false)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`/courses/${id}/`)
        setCourse(response.data)
        
        if (user?.is_learner) {
          const bookings = await api.get('/bookings/')
          const booking = bookings.data.find(
            b => b.course.id === parseInt(id) && !b.is_cancelled
          )
          setIsBooked(!!booking)
        }
      } catch (error) {
        toast.error('Failed to fetch course details')
        navigate('/')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCourse()
  }, [id, user, navigate])

  const handleBookCourse = async () => {
    try {
      await api.post('/bookings/', { course: id })
      toast.success('Course booked successfully!')
      setIsBooked(true)
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to book course')
    }
  }

  const handleCancelBooking = async () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const bookings = await api.get('/bookings/')
        const booking = bookings.data.find(
          b => b.course.id === parseInt(id) && !b.is_cancelled
        )
        
        if (booking) {
          await api.patch(`/bookings/${booking.id}/cancel/`, { confirm: true })
          toast.success('Booking cancelled successfully')
          setIsBooked(false)
        }
      } catch (error) {
        toast.error('Failed to cancel booking')
      }
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!course) {
    return <div>Course not found</div>
  }

  const isFull = course.slots_booked >= course.slots_total
  const isUpcoming = new Date(course.start_date) > new Date()

  return (
    <Container className="mt-4">
      <Button variant="outline-secondary" onClick={() => navigate(-1)} className="mb-3">
        Back
      </Button>
      
      <Card>
        {course.course_picture && (
          <Card.Img variant="top" src={course.course_picture} style={{ maxHeight: '400px', objectFit: 'cover' }} />
        )}
        <Card.Body>
          <Card.Title>{course.title}</Card.Title>
          <Card.Subtitle className="mb-3 text-muted">
            Instructor: {course.instructor?.username || 'Admin'}
          </Card.Subtitle>
          
          <div className="mb-4">
            {course.languages?.map(lang => (
              <Badge bg="secondary" className="me-2" key={lang}>
                {lang}
              </Badge>
            ))}
            <Badge bg="info" className="me-2">
              {course.duration_hours} hours
            </Badge>
            {isFull && <Badge bg="danger">Full</Badge>}
            {isUpcoming && <Badge bg="warning" className="ms-2">Upcoming</Badge>}
          </div>
          
          <Card.Text>{course.description}</Card.Text>
          
          <Row className="mt-4">
            <Col md={6}>
              <h5>Course Details</h5>
              <ul>
                <li>
                  <strong>Start Date:</strong> {new Date(course.start_date).toLocaleDateString()}
                </li>
                <li>
                  <strong>End Date:</strong> {new Date(course.end_date).toLocaleDateString()}
                </li>
                <li>
                  <strong>Available Slots:</strong> {course.slots_total - course.slots_booked} / {course.slots_total}
                </li>
              </ul>
            </Col>
          </Row>
        </Card.Body>
        
        {user?.is_learner && (
          <Card.Footer className="text-end">
            {isBooked ? (
              <Button variant="danger" onClick={handleCancelBooking}>
                Cancel Booking
              </Button>
            ) : (
              <Button 
                variant="accent" 
                onClick={handleBookCourse}
                disabled={isFull}
              >
                {isFull ? 'Course Full' : 'Book Now'}
              </Button>
            )}
          </Card.Footer>
        )}
      </Card>
    </Container>
  )
}

export default CourseDetail
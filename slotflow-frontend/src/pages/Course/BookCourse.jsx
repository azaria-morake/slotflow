import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, Alert, Spinner } from 'react-bootstrap'
import api from '../../utils/api'
import { toast } from 'react-toastify'
import { useAuth } from '../../hooks/useAuth'

const BookCourse = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBooked, setIsBooked] = useState(false)
  const [isFull, setIsFull] = useState(false)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`/courses/${id}/`)
        setCourse(response.data)
        setIsFull(response.data.slots_booked >= response.data.slots_total)
        
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
      setIsFull(prev => {
        const updatedCourse = { ...course, slots_booked: course.slots_booked + 1 }
        setCourse(updatedCourse)
        return updatedCourse.slots_booked >= updatedCourse.slots_total
      })
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
          setIsFull(prev => {
            const updatedCourse = { ...course, slots_booked: course.slots_booked - 1 }
            setCourse(updatedCourse)
            return updatedCourse.slots_booked >= updatedCourse.slots_total
          })
        }
      } catch (error) {
        toast.error('Failed to cancel booking')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    )
  }

  if (!course) {
    return <Alert variant="danger">Course not found</Alert>
  }

  return (
    <div className="container mt-4">
      <Card>
        <Card.Header>
          <h3>{course.title}</h3>
        </Card.Header>
        <Card.Body>
          <Card.Text>{course.description}</Card.Text>
          
          <div className="mb-3">
            <strong>Instructor:</strong> {course.instructor?.username || 'Admin'}
          </div>
          
          <div className="mb-3">
            <strong>Duration:</strong> {course.duration_hours} hours
          </div>
          
          <div className="mb-3">
            <strong>Start Date:</strong> {new Date(course.start_date).toLocaleDateString()}
          </div>
          
          <div className="mb-3">
            <strong>Available Slots:</strong> {course.slots_total - course.slots_booked} / {course.slots_total}
          </div>
          
          {isFull && !isBooked && (
            <Alert variant="warning" className="mt-3">
              This course is currently full.
            </Alert>
          )}
        </Card.Body>
        <Card.Footer className="d-flex justify-content-between">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Back
          </Button>
          
          {user?.is_learner && (
            isBooked ? (
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
            )
          )}
        </Card.Footer>
      </Card>
    </div>
  )
}

export default BookCourse
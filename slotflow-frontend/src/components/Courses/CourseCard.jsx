import { Card, Button, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const CourseCard = ({ course, onBook, onCancel, isBooked }) => {
  console.log('CourseCard received course:', course);
  console.log('Course ID:', course?.id);
  
  // Format date safely within CourseCard
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Date not set' : date.toLocaleDateString();
    } catch {
      return 'Date not set';
    }
  };

  const isFull = course.slots_booked >= course.slots_total
  const isUpcoming = new Date(course.start_date) > new Date()

  return (
    <Card className="mb-4">
      {course.course_picture && (
        <Card.Img variant="top" src={course.course_picture} />
      )}
      <Card.Body>
        <Card.Title>{course.title}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          {course.instructor?.username || 'Admin'}
        </Card.Subtitle>
        <Card.Text className="text-truncate">{course.description}</Card.Text>
        
        <div className="mb-3">
          <Badge bg="info" className="me-2">
            {course.duration_hours} hours
          </Badge>
          {course.languages?.map(lang => (
            <Badge bg="secondary" className="me-2" key={lang}>
              {lang}
            </Badge>
          ))}
          {isFull && <Badge bg="danger">Full</Badge>}
          {isUpcoming && <Badge bg="warning" className="ms-2">Upcoming</Badge>}
        </div>
        
        <div className="d-flex justify-content-between">
          <Button 
            variant="outline-primary" 
            as={Link} 
            to={`/courses/${course.id}`}
          >
            View Details
          </Button>
          
          {isBooked ? (
            <Button variant="danger" onClick={() => onCancel(course.id)}>
              Cancel Booking
            </Button>
          ) : (
            <Button 
              variant="accent" 
              onClick={() => onBook(course.id)}
              disabled={isFull}
            >
              {isFull ? 'Course Full' : 'Book Now'}
            </Button>
          )}
        </div>
      </Card.Body>
      <Card.Footer className="text-muted">
        {course.slots_booked}/{course.slots_total} slots filled • Starts: {formatDate(course.start_date)}
      </Card.Footer>
    </Card>
  )
}

export default CourseCard
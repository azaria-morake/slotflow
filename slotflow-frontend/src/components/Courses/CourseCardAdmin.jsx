import { Card, Button, Badge, ButtonGroup } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const CourseCardAdmin = ({ course, onEdit, onDelete }) => {
  const isFull = course.slots_booked >= course.slots_total
  const isActive = course.is_active

  return (
    <Card className="mb-4">
      {course.course_picture && (
        <Card.Img variant="top" src={course.course_picture} />
      )}
      <Card.Body>
        <Card.Title>{course.title}</Card.Title>
        <Card.Text className="text-truncate">{course.description}</Card.Text>
        
        <div className="mb-3">
          <Badge bg={isActive ? 'success' : 'secondary'} className="me-2">
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
          <Badge bg={isFull ? 'danger' : 'success'} className="me-2">
            {isFull ? 'Full' : `${course.slots_total - course.slots_booked} slots available`}
          </Badge>
          <Badge bg="info" className="me-2">
            {course.duration_hours} hours
          </Badge>
        </div>
        
        <ButtonGroup className="w-100">
          <Button variant="outline-primary" onClick={() => onEdit(course)}>
            Edit
          </Button>
          <Button 
            variant="outline-danger" 
            onClick={() => onDelete(course.id)}
          >
            Delete
          </Button>
          <Button 
            variant="outline-secondary" 
            as={Link} 
            to={`/courses/${course.id}`}
          >
            View
          </Button>
        </ButtonGroup>
      </Card.Body>
      <Card.Footer className="text-muted">
        {course.slots_booked}/{course.slots_total} slots • Starts: {new Date(course.start_date).toLocaleDateString()}
      </Card.Footer>
    </Card>
  )
}

export default CourseCardAdmin
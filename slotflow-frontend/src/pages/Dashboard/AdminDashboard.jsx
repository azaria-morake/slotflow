import { useState, useEffect } from 'react'
import { Button, Modal, Container, Row, Col } from 'react-bootstrap'
import CourseCardAdmin from '../../components/Courses/CourseCardAdmin'
import CourseForm from '../../components/Courses/CourseForm'
import api from '../../utils/api'
import { toast } from 'react-toastify'
import LoadingSpinner from '../../components/Common/LoadingSpinner'

const AdminDashboard = () => {
  const [courses, setCourses] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [currentCourse, setCurrentCourse] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/courses/')
      setCourses(response.data)
    } catch (error) {
      toast.error('Failed to fetch courses')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCourse = () => {
    setCurrentCourse(null)
    setShowModal(true)
  }

  const handleEditCourse = (course) => {
    setCurrentCourse(course)
    setShowModal(true)
  }

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await api.delete(`/courses/${courseId}/`)
        setCourses(courses.filter(course => course.id !== courseId))
        toast.success('Course deleted successfully')
      } catch (error) {
        toast.error('Failed to delete course')
      }
    }
  }

const handleSubmitCourse = async (data) => {
  try {
    const formData = new FormData();

    // Required fields check
    const requiredFields = [
      'title', 'description', 'start_date', 
      'end_date', 'duration_hours', 'slots_total'
    ];
    
    requiredFields.forEach(field => {
      if (!data[field]) {
        throw new Error(`${field} is required`);
      }
    });

    // Convert dates to YYYY-MM-DD format
    const formatDate = (date) => {
      if (date instanceof Date) return date.toISOString().split('T')[0];
      if (typeof date === 'string') return date.split('T')[0];
      return date;
    };

    // Append all data
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('start_date', formatDate(data.start_date));
    formData.append('end_date', formatDate(data.end_date));
    formData.append('duration_hours', Number(data.duration_hours));
    formData.append('slots_total', Number(data.slots_total));
    
    // Handle languages array
    if (Array.isArray(data.languages)) {
      data.languages.forEach(lang => formData.append('languages', lang));
    } else {
      formData.append('languages', 'English'); // default
    }

    // Handle file upload
    if (data.course_picture instanceof File) {
      if (data.course_picture.size > 0) {
        formData.append('course_picture', data.course_picture);
      }
    } else if (data.course_picture && typeof data.course_picture === 'string') {
      // Existing image URL, no need to re-upload
    }

    const config = {
      headers: {
},
    };

    const response = currentCourse
      ? await api.patch(`/courses/${currentCourse.id}/`, formData, config)
      : await api.post('/courses/', formData, config);

    // Handle response
    setCourses(prev => 
      currentCourse
        ? prev.map(c => c.id === currentCourse.id ? response.data : c)
        : [...prev, response.data]
    );
    
    toast.success(`Course ${currentCourse ? 'updated' : 'created'} successfully`);
    setShowModal(false);
    
  } catch (error) {
    console.error('Detailed error:', error);
    
    let errorMessage = 'Failed to save course';
    if (error.response) {
      // Handle Django validation errors
      if (error.response.data) {
        errorMessage = Object.entries(error.response.data)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('\n');
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage);
  }
};

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2>Admin Dashboard</h2>
        </Col>
        <Col className="text-end">
          <Button variant="accent" onClick={handleCreateCourse}>
            Create New Course
          </Button>
        </Col>
      </Row>
      
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Row>
          {courses.map(course => (
            <Col key={course.id} md={6} lg={4}>
              <CourseCardAdmin
                course={course}
                onEdit={handleEditCourse}
                onDelete={handleDeleteCourse}
              />
            </Col>
          ))}
        </Row>
      )}
      
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {currentCourse ? 'Edit Course' : 'Create New Course'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CourseForm
            onSubmit={handleSubmitCourse}
            initialData={currentCourse}
          />
        </Modal.Body>
      </Modal>
    </Container>
  )
}

export default AdminDashboard
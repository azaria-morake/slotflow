import { useState, useEffect } from 'react';
import { Container, Row, Col, Tab, Tabs, Spinner, Alert } from 'react-bootstrap';
import CourseCard from '../../components/Courses/CourseCard';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';

const LearnerDashboard = () => {
  const { user, logout } = useAuth();
  const [availableCourses, setAvailableCourses] = useState([]);
  const [bookedCourses, setBookedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [error, setError] = useState(null);

  // Format date safely
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Date not set' : date.toLocaleDateString();
    } catch {
      return 'Date not set';
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [coursesResponse, bookingsResponse] = await Promise.all([
        api.get('/courses/'),
        api.get('/bookings/')
      ]);
      
      setAvailableCourses(coursesResponse.data);
      setBookedCourses(bookingsResponse.data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load data. Please try again.');
      
      // Handle 401 unauthorized
      if (err.response?.status === 401) {
        logout();
        toast.error('Session expired. Please log in again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookCourse = async (courseId) => {
    try {
      // Check if course is already booked
      const alreadyBooked = bookedCourses.some(
        b => b.course.id === courseId && !b.is_cancelled
      );
      
      if (alreadyBooked) {
        throw new Error('You have already booked this course');
      }

      // Check course availability
      const course = availableCourses.find(c => c.id === courseId);
      if (!course || course.slots_booked >= course.slots_total) {
        throw new Error('Course is full');
      }

      await api.post('/bookings/', { course: courseId });
      await fetchData(); // Refresh all data
      toast.success('Course booked successfully!');
    } catch (err) {
      console.error('Booking error:', err);
      const errorMsg = err.response?.data?.detail || 
                      err.message || 
                      'Failed to book course';
      toast.error(errorMsg);
    }
  };

  const handleCancelBooking = async (courseId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      // Find the active booking
      const booking = bookedCourses.find(
        b => b.course.id === courseId && !b.is_cancelled
      );

      if (!booking) {
        throw new Error('Active booking not found');
      }

      await api.patch(`/bookings/${booking.id}/cancel/`, { confirm: true });
      await fetchData(); // Refresh all data
      toast.success('Booking cancelled successfully');
    } catch (err) {
      console.error('Cancellation error:', err);
      const errorMsg = err.response?.data?.detail || 
                     err.message || 
                     'Failed to cancel booking';
      toast.error(errorMsg);
    }
  };

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Learner Dashboard</h2>
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="available" title="Available Courses">
  {isLoading ? (
    <div className="text-center my-4">
      <Spinner animation="border" />
    </div>
  ) : (
    <Row>
      {availableCourses.map(course => {
        console.log('Original course:', course);
        console.log('Course ID:', course.id);
        
        const isBooked = bookedCourses.some(
          b => b.course.id === course.id && !b.is_cancelled
        );
        
        return (
          <Col key={course.id} md={6} lg={4} className="mb-4">
            <CourseCard
              course={course}
              onBook={!isBooked ? () => handleBookCourse(course.id) : null}
              onCancel={isBooked ? () => handleCancelBooking(course.id) : null}
              isBooked={isBooked}
            />
          </Col>
        );
      })}
    </Row>
  )}
</Tab>
        
<Tab eventKey="booked" title="My Bookings">
  {isLoading ? (
    <div className="text-center my-4">
      <Spinner animation="border" />
    </div>
  ) : (
    <Row>
      {bookedCourses
        .filter(b => !b.is_cancelled)
        .map(booking => {
          // Find the full course data from availableCourses
          const fullCourse = availableCourses.find(course => 
            course.id === booking.course.id
          );
          
          // Use full course data if available, otherwise use booking.course
          const courseToDisplay = fullCourse || booking.course;
          
          console.log('Using course data:', courseToDisplay);
          
          return (
            <Col key={booking.id} md={6} lg={4} className="mb-4">
              <CourseCard
                course={courseToDisplay}
                onCancel={() => handleCancelBooking(booking.course.id)}
                isBooked={true}
              />
            </Col>
          );
        })
      }
    </Row>
  )}
</Tab>
      </Tabs>
    </Container>
  );
};

export default LearnerDashboard;  
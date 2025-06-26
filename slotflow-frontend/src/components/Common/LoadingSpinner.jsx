import { Spinner } from 'react-bootstrap'

const LoadingSpinner = ({ fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="loading-screen">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <div className="loading-bar"></div>
      </div>
    )
  }

  return (
    <div className="d-flex justify-content-center my-4">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  )
}

export default LoadingSpinner
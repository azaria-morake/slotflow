import { Spinner } from 'react-bootstrap'

const Button = ({ children, isLoading, variant = 'primary', ...props }) => {
  return (
    <button
      className={`btn btn-${variant} ${props.className || ''}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
          <span className="visually-hidden">Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
import { Form } from 'react-bootstrap'

const FormInput = ({
  label,
  name,
  type = 'text',
  register,
  errors,
  placeholder,
  ...props
}) => {
  return (
    <Form.Group className="mb-3">
      {label && <Form.Label>{label}</Form.Label>}
      <Form.Control
        type={type}
        placeholder={placeholder}
        isInvalid={!!errors?.[name]}
        {...register(name)}
        {...props}
      />
      {errors?.[name] && (
        <Form.Control.Feedback type="invalid">
          {errors[name].message}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  )
}

export default FormInput
import { useState, useRef } from 'react'
import { Form } from 'react-bootstrap'

const ImageUpload = ({ label, name, register, errors, initialImage = null, onImageChange }) => {
  const [preview, setPreview] = useState(initialImage)
  const fileInputRef = useRef(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
        if (onImageChange) onImageChange(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (onImageChange) onImageChange(null)
  }

  return (
    <Form.Group className="mb-3">
      {label && <Form.Label>{label}</Form.Label>}
      {preview && (
        <div className="d-flex flex-column align-items-center mb-3">
          <img src={preview} alt="Preview" className="image-preview" />
          <button
            type="button"
            className="btn btn-sm btn-danger"
            onClick={handleRemoveImage}
          >
            Remove Image
          </button>
        </div>
      )}
      <Form.Control
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageChange}
        isInvalid={!!errors?.[name]}
        {...register(name)}
      />
      {errors?.[name] && (
        <Form.Control.Feedback type="invalid">
          {errors[name].message}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  )
}

export default ImageUpload
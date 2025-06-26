import { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import FormInput from '../Common/FormInput'
import ImageUpload from '../Common/ImageUpload'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { courseSchema } from '../../utils/validators'

const CourseForm = ({ onSubmit, initialData, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: yupResolver(courseSchema),
    defaultValues: initialData || {
      languages: ['English']
    }
  })

  const [selectedImage, setSelectedImage] = useState(initialData?.course_picture || null)

  const languages = watch('languages', initialData?.languages || ['English'])

  const handleLanguageChange = (e) => {
    const options = e.target.options
    const selectedLanguages = []
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedLanguages.push(options[i].value)
      }
    }
    setValue('languages', selectedLanguages)
  }

  const handleImageChange = (file) => {
    setImageFile(file);
    setValue('course_picture', file, { shouldValidate: true });
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormInput
        label="Course Title"
        name="title"
        register={register}
        errors={errors}
        placeholder="Enter course title"
      />
      
      <FormInput
        label="Description"
        name="description"
        register={register}
        errors={errors}
        placeholder="Enter course description"
        as="textarea"
        rows={4}
      />
      
      <div className="row">
        <div className="col-md-6">
          <FormInput
            label="Start Date"
            name="start_date"
            type="date"
            register={register}
            errors={errors}
          />
        </div>
        <div className="col-md-6">
          <FormInput
            label="End Date"
            name="end_date"
            type="date"
            register={register}
            errors={errors}
          />
        </div>
      </div>
      
      <FormInput
        label="Duration (hours)"
        name="duration_hours"
        type="number"
        register={register}
        errors={errors}
        placeholder="Enter duration in hours"
      />
      
      <FormInput
        label="Total Slots"
        name="slots_total"
        type="number"
        register={register}
        errors={errors}
        placeholder="Enter total available slots"
      />
      
      <Form.Group className="mb-3">
        <Form.Label>Languages</Form.Label>
        <Form.Select
          multiple
          value={languages}
          onChange={handleLanguageChange}
          isInvalid={!!errors?.languages}
        >
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="German">German</option>
        </Form.Select>
        {errors?.languages && (
          <Form.Control.Feedback type="invalid">
            {errors.languages.message}
          </Form.Control.Feedback>
        )}
      </Form.Group>
      
      <ImageUpload
        label="Course Image"
        name="course_picture"
        register={register}
        errors={errors}
        onImageChange={handleImageChange}
        initialImage={initialData?.course_picture}
      />
      
      <Button 
        type="submit" 
        variant="accent" 
        className="w-100" 
        disabled={isLoading}
      >
        {isLoading ? 'Saving...' : 'Save Course'}
      </Button>
    </Form>
  )
}

export default CourseForm
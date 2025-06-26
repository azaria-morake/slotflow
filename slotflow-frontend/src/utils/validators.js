import * as yup from 'yup'

export const registerSchema = yup.object().shape({
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
  email: yup.string().required('Email is required').email('Invalid email format'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase, one lowercase, one number and one special character'
    ),
  password2: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
  role: yup.string().required('Role is required').oneOf(['admin', 'learner'], 'Invalid role')
})

export const loginSchema = yup.object().shape({
  username: yup.string().required('Username or email is required'),
  password: yup.string().required('Password is required')
})

export const courseSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  start_date: yup.date().required('Start date is required').min(new Date(), 'Start date must be in the future'),
  end_date: yup.date()
    .required('End date is required')
    .min(yup.ref('start_date'), 'End date must be after start date'),
  duration_hours: yup.number().required('Duration is required').min(1, 'Duration must be at least 1 hour'),
  languages: yup.array().min(1, 'At least one language is required'),
  slots_total: yup.number().required('Total slots is required').min(1, 'Must have at least 1 slot')
})

export const profileSchema = yup.object().shape({
  username: yup.string().required('Username is required'),
  email: yup.string().required('Email is required').email('Invalid email format')
})

export const passwordSchema = yup.object().shape({
  old_password: yup.string().required('Current password is required'),
  new_password: yup.string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase, one lowercase, one number and one special character'
    ),
  confirm_password: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('new_password'), null], 'Passwords must match')
})
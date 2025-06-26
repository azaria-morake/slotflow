import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Toast = {
  success: (message, options = {}) => {
    toast.success(message, {
      position: 'bottom-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      ...options,
      className: 'toast-success',
    })
  },
  
  error: (message, options = {}) => {
    toast.error(message, {
      position: 'bottom-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      ...options,
      className: 'toast-error',
    })
  },
  
  info: (message, options = {}) => {
    toast.info(message, {
      position: 'bottom-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      ...options,
      className: 'toast-info',
    })
  },
  
  warning: (message, options = {}) => {
    toast.warning(message, {
      position: 'bottom-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      ...options,
      className: 'toast-warning',
    })
  },
}

export default Toast
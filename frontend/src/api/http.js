import axios from 'axios'
import { ElMessage } from 'element-plus'

// Create axios instance
const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
http.interceptors.request.use(
  (config) => {
    // Add loading indicator if needed
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
http.interceptors.response.use(
  (response) => {
    // Return the full response for components to handle
    return response
  },
  (error) => {
    // Handle network errors
    let message = 'Network error'
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      message = data.message || `Server error (${status})`
      
      switch (status) {
        case 400:
          message = data.message || 'Bad request'
          break
        case 401:
          message = 'Unauthorized access'
          break
        case 403:
          message = 'Access forbidden'
          break
        case 404:
          message = 'Resource not found'
          break
        case 500:
          message = 'Internal server error'
          break
        default:
          message = `Server error (${status})`
      }
    } else if (error.request) {
      // Request was made but no response received
      message = 'No response from server'
    } else {
      // Request setup error
      message = error.message || 'Request failed'
    }
    
    ElMessage.error(message)
    return Promise.reject(new Error(message))
  }
)

export default http
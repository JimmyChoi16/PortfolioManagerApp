import http from './http'

const bondsAPI = {
  // Get all bonds
  getBonds() {
    return http.get('/bonds')
  },

  // Get bond by ID
  getBond(id) {
    return http.get(`/bonds/${id}`)
  },

  // Create new bond
  createBond(data) {
    return http.post('/bonds', data)
  },

  // Update bond
  updateBond(id, data) {
    return http.put(`/bonds/${id}`, data)
  },

  // Delete bond
  deleteBond(id) {
    return http.delete(`/bonds/${id}`)
  },

  // Get bond statistics
  getBondStats() {
    return http.get('/bonds/stats')
  }
}

export default bondsAPI 
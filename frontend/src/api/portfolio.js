import http from './http'

const portfolioAPI = {
  // Holdings endpoints
  getHoldings() {
    return http.get('/holdings')
  },

  getHolding(id) {
    return http.get(`/holdings/${id}`)
  },

  createHolding(data) {
    return http.post('/holdings', data)
  },

  updateHolding(id, data) {
    return http.put(`/holdings/${id}`, data)
  },

  deleteHolding(id) {
    return http.delete(`/holdings/${id}`)
  },

  // Portfolio summary
  getPortfolioSummary() {
    return http.get('/holdings/summary')
  },

  // Historical data
  getHistoricalData() {
    return http.get('/holdings/historical')
  },

  // Update current prices
  updateCurrentPrices() {
    return http.post('/holdings/update-prices')
  }
}

export default portfolioAPI
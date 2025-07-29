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
  },

  // Analysis endpoints
  getAllocationAnalysis() {
    return http.get('/holdings/analysis/allocation')
  },

  getPerformanceAnalysis() {
    return http.get('/holdings/analysis/performance')
  },

  getSectorAnalysis() {
    return http.get('/holdings/analysis/sector')
  },

  getDetailedHistoryAnalysis() {
    return http.get('/holdings/analysis/history')
  },

  // New Portfolio Management endpoints
  createPortfolio(data) {
    return http.post('/portfolio', data);
  }
}

export default portfolioAPI
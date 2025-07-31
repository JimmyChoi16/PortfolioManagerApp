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

  // Update fund prices with real-time data
  updateFundPrices() {
    return http.post('/holdings/update-fund-prices')
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

  // Fund-specific endpoints
  getFunds() {
    return http.get('/holdings/funds')
  },

  getFundCategories() {
    return http.get('/holdings/funds/categories')
  },

  getFundPerformance() {
    return http.get('/holdings/funds/performance')
  },

  addFundHoldings(data) {
    return http.post('/holdings/funds', data)
  },

  getFundVolatility(symbol) {
    return http.get(`/holdings/funds/${symbol}/volatility`)
  },

  getFundReturns(symbol) {
    return http.get(`/holdings/funds/${symbol}/returns`)
  },

  getFundPerformanceHistory(symbol) {
    return http.get(`/holdings/funds/${symbol}/performance-history`)
  },

  searchFunds(query) {
    return http.get(`/holdings/funds/search?q=${encodeURIComponent(query)}`)
  },

  // Trade endpoints
  executeTrade(data) {
    return http.post('/holdings/trade', data)
  },

  // Real-time performance metrics
  getRealTimePerformanceMetrics() {
    return http.get('/holdings/analysis/realtime-metrics')
  },

  // Update portfolio history
  updatePortfolioHistory() {
    return http.post('/holdings/update-history')
  },

  // Manual update portfolio history
  updatePortfolioHistoryManual() {
    return http.post('/holdings/update-portfolio-history')
  },

  // New Portfolio Management endpoints
  createPortfolio(data) {
    return http.post('/portfolio', data);
  }
}

export default portfolioAPI
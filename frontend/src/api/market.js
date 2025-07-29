import http from './http'

const marketAPI = {
  // Search symbols
  searchSymbols(query) {
    return http.get(`/market/search?query=${query}`)
  },

  // Get quote for specific symbol
  getQuote(symbol) {
    return http.get(`/market/quote/${symbol}`)
  },

  // Get quotes for multiple symbols
  getMultipleQuotes(symbols) {
    return http.post('/market/quotes', { symbols })
  },

  // Get historical data
  getHistoricalData(symbol, period = '1mo', interval = '1d') {
    return http.get(`/market/historical/${symbol}?period=${period}&interval=${interval}`)
  },

  // Get trending stocks
  getTrendingStocks() {
    return http.get('/market/trending')
  },

  // Get public quotes
  getPublicQuotes() {
    return http.get('/market/public-quotes')
  },

  // Recommendations
  getRecommendations() {
    return http.get('/market/recommendations')
  },

  getRecommendationBySymbol(symbol) {
    return http.get(`/market/recommendations/${symbol}`)
  }
}

export default marketAPI
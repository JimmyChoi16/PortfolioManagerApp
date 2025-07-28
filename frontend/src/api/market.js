import http from './http'

const marketAPI = {
  // Search symbols
  searchSymbols(query) {
    return http.get(`/market/search?query=${encodeURIComponent(query)}`)
  },

  // Get single quote
  getQuote(symbol) {
    return http.get(`/market/quote/${symbol}`)
  },

  // Get multiple quotes
  getMultipleQuotes(symbols) {
    return http.post('/market/quotes', { symbols })
  },

  // Get public quotes for homepage
  getMarketQuotes() {
    return http.get('/market/public-quotes')
  },

  // Get historical data
  getHistoricalData(symbol, period = '1mo', interval = '1d') {
    return http.get(`/market/historical/${symbol}?period=${period}&interval=${interval}`)
  },

  // Get trending stocks
  getTrendingStocks() {
    return http.get('/market/trending')
  }
}

export default marketAPI
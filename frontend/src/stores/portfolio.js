import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import portfolioAPI from '@/api/portfolio'

export const usePortfolioStore = defineStore('portfolio', () => {
  // State
  const holdings = ref([])
  const portfolioSummary = ref({
    summary: {
      total_holdings: 0,
      total_value: 0,
      total_gain: 0,
      avg_gain_percent: 0
    },
    topPerformers: []
  })
  const historicalData = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const totalValue = computed(() => portfolioSummary.value.summary.total_value || 0)
  const totalGain = computed(() => portfolioSummary.value.summary.total_gain || 0)
  const gainPercent = computed(() => portfolioSummary.value.summary.avg_gain_percent || 0)
  const totalHoldings = computed(() => portfolioSummary.value.summary.total_holdings || 0)
  const topPerformers = computed(() => portfolioSummary.value.topPerformers || [])

  // Actions
  const fetchHoldings = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await portfolioAPI.getHoldings()
      holdings.value = response.data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching holdings:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchPortfolioSummary = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await portfolioAPI.getPortfolioSummary()
      portfolioSummary.value = response.data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching portfolio summary:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchHistoricalData = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await portfolioAPI.getHistoricalData()
      historicalData.value = response.data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching historical data:', err)
    } finally {
      loading.value = false
    }
  }

  const createHolding = async (holdingData) => {
    try {
      loading.value = true
      error.value = null
      const response = await portfolioAPI.createHolding(holdingData)
      await fetchHoldings() // Refresh holdings list
      await fetchPortfolioSummary() // Refresh summary
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateHolding = async (id, holdingData) => {
    try {
      loading.value = true
      error.value = null
      const response = await portfolioAPI.updateHolding(id, holdingData)
      await fetchHoldings() // Refresh holdings list
      await fetchPortfolioSummary() // Refresh summary
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteHolding = async (id) => {
    try {
      loading.value = true
      error.value = null
      await portfolioAPI.deleteHolding(id)
      await fetchHoldings() // Refresh holdings list
      await fetchPortfolioSummary() // Refresh summary
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateCurrentPrices = async () => {
    try {
      loading.value = true
      error.value = null
      await portfolioAPI.updateCurrentPrices()
      await fetchHoldings() // Refresh holdings with new prices
      await fetchPortfolioSummary() // Refresh summary
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const refreshAll = async () => {
    await Promise.all([
      fetchHoldings(),
      fetchPortfolioSummary(),
      fetchHistoricalData()
    ])
  }

  return {
    // State
    holdings,
    portfolioSummary,
    historicalData,
    loading,
    error,
    
    // Computed
    totalValue,
    totalGain,
    gainPercent,
    totalHoldings,
    topPerformers,
    
    // Actions
    fetchHoldings,
    fetchPortfolioSummary,
    fetchHistoricalData,
    createHolding,
    updateHolding,
    deleteHolding,
    updateCurrentPrices,
    refreshAll
  }
})
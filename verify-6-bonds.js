// Verify 6 active bonds yield curve display
const activeBonds = [
  { symbol: 'UST10Y', yield: 4.28, maturity: '2034-05-15', type: 'government' },
  { symbol: 'AAPL5Y', yield: 4.12, maturity: '2029-03-15', type: 'corporate' },
  { symbol: 'CAMUNI7', yield: 3.52, maturity: '2031-08-20', type: 'municipal' },
  { symbol: 'DEBUND5', yield: 2.18, maturity: '2029-12-10', type: 'international' },
  { symbol: 'UST30Y', yield: 3.95, maturity: '2053-01-15', type: 'government' },
  { symbol: 'MSFT7Y', yield: 4.05, maturity: '2030-02-20', type: 'corporate' }
]

// Calculate duration from maturity date
const calculateDuration = (maturityDate) => {
  const today = new Date()
  const maturity = new Date(maturityDate)
  const diffTime = maturity.getTime() - today.getTime()
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25)
  return Math.max(0, parseFloat(diffYears.toFixed(1)))
}

console.log('📊 6条有效债券数据分析')
console.log('=' * 50)
console.log('当前日期:', new Date().toISOString().split('T')[0])
console.log('')

// Process and sort bonds
const processedBonds = activeBonds.map(bond => ({
  symbol: bond.symbol,
  yield: bond.yield,
  duration: calculateDuration(bond.maturity),
  type: bond.type,
  maturity: bond.maturity
})).sort((a, b) => a.duration - b.duration)

console.log('💼 原始数据 (按期限排序):')
processedBonds.forEach((bond, index) => {
  console.log(`${index + 1}. ${bond.symbol} (${bond.type})`)
  console.log(`   期限: ${bond.duration} 年 (${bond.maturity})`)
  console.log(`   收益率: ${bond.yield}%`)
  console.log('')
})

// Calculate chart ranges
const durations = processedBonds.map(b => b.duration)
const yields = processedBonds.map(b => b.yield)
const minDuration = Math.min(...durations)
const maxDuration = Math.max(...durations)
const minYield = Math.min(...yields)
const maxYield = Math.max(...yields)

console.log('📈 收益率曲线范围:')
console.log(`期限范围: ${minDuration} - ${maxDuration} 年`)
console.log(`收益率范围: ${minYield}% - ${maxYield}%`)
console.log('')

// Calculate SVG coordinates (500x300)
console.log('📍 SVG图表坐标 (500x300):')
processedBonds.forEach(bond => {
  const x = ((bond.duration - minDuration) / (maxDuration - minDuration)) * 500
  const y = 300 - ((bond.yield - minYield) / (maxYield - minYield)) * 300
  console.log(`${bond.symbol}: (${x.toFixed(1)}, ${y.toFixed(1)}) - ${bond.duration}年, ${bond.yield}%`)
})

console.log('')
console.log('🔗 连接线路径:')
const polylinePoints = processedBonds.map(bond => {
  const x = ((bond.duration - minDuration) / (maxDuration - minDuration)) * 500
  const y = 300 - ((bond.yield - minYield) / (maxYield - minYield)) * 300
  return `${x.toFixed(1)},${y.toFixed(1)}`
}).join(' ')
console.log(`SVG Polyline: ${polylinePoints}`)

console.log('')
console.log('✅ 验证检查:')
console.log(`- 总债券数: ${processedBonds.length} 条 (应该是6条)`)
console.log(`- 最短期限: ${minDuration} 年 (${processedBonds[0].symbol})`)
console.log(`- 最长期限: ${maxDuration} 年 (${processedBonds[processedBonds.length-1].symbol})`)
console.log(`- 最低收益率: ${minYield}% (${processedBonds.find(b => b.yield === minYield).symbol})`)
console.log(`- 最高收益率: ${maxYield}% (${processedBonds.find(b => b.yield === maxYield).symbol})`)

console.log('')
console.log('🎯 预期收益率曲线特征:')
console.log('- 应该有6个数据点')
console.log('- 数据点应该按期限从左到右排列')
console.log('- 最左侧: UKGILT5 (2.7年)')
console.log('- 最右侧: UST30Y (28.4年)')
console.log('- 连接线应该穿过所有6个点') 
<template>
  <div class="fund-section">
    <!-- Header -->
    <div class="section-header">
      <h1>Fund Management</h1>
      <p>Track and manage your investment funds with real-time data and insights</p>
      <div class="login-notice">
        <p>⚠️ You are not logged in. All data shown is for demonstration purposes only.</p>
      </div>
    </div>

    <!-- Fund Categories Grid -->
     <!-- TODO: Need to change to mock data, will show the real after login sucessfully -->
    <div class="fund-categories">
      <div class="fund-category-card">
        <div class="category-icon">📊</div>
        <h3>Index Funds</h3>
        <p>Broad market exposure with low expense ratios</p>
        <div class="fund-count">12 funds</div>
      </div>
      
      <div class="fund-category-card">
        <div class="category-icon">🎯</div>
        <h3>Active Funds</h3>
        <p>Professional management for potential outperformance</p>
        <div class="fund-count">8 funds</div>
      </div>
      
      <div class="fund-category-card">
        <div class="category-icon">🌍</div>
        <h3>International</h3>
        <p>Global diversification opportunities</p>
        <div class="fund-count">15 funds</div>
      </div>
      
      <div class="fund-category-card">
        <div class="category-icon">🏢</div>
        <h3>Sector Funds</h3>
        <p>Targeted exposure to specific industries</p>
        <div class="fund-count">6 funds</div>
      </div>
    </div>

    <!-- Fund Performance Table -->
    <div class="fund-performance">
      <h2>Top Performing Funds</h2>
      <div class="performance-table">
        <table>
          <thead>
            <tr>
              <th>Fund Name</th>
              <th>Ticker</th>
              <th>Category</th>
              <th>YTD Return</th>
              <th>1 Year</th>
              <th>Expense Ratio</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Vanguard Total Stock Market</td>
              <td>VTSAX</td>
              <td>Large Blend</td>
              <td class="positive">+12.5%</td>
              <td class="positive">+18.2%</td>
              <td>0.04%</td>
            </tr>
            <tr>
              <td>Fidelity 500 Index</td>
              <td>FXAIX</td>
              <td>Large Blend</td>
              <td class="positive">+11.8%</td>
              <td class="positive">+17.5%</td>
              <td>0.015%</td>
            </tr>
            <tr>
              <td>American Funds Growth</td>
              <td>AGTHX</td>
              <td>Large Growth</td>
              <td class="positive">+15.2%</td>
              <td class="positive">+22.1%</td>
              <td>0.64%</td>
            </tr>
            <tr>
              <td>Vanguard International</td>
              <td>VTIAX</td>
              <td>Foreign Large Blend</td>
              <td class="positive">+8.7%</td>
              <td class="positive">+14.3%</td>
              <td>0.11%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Fund Allocation Chart -->
    <div class="fund-allocation">
      <h2>Fund Allocation</h2>
      <div class="allocation-chart">
        <div class="chart-placeholder">
          <div class="chart-icon">📈</div>
          <p>Fund Allocation Chart</p>
          <span>Interactive chart showing your fund distribution</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Fund section component logic will be added here
</script>

<style scoped>
.fund-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
}

.section-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 16px;
}

.section-header p {
  font-size: 1.2rem;
  color: #7f8c8d;
  max-width: 600px;
  margin: 0 auto;
}

.login-notice {
  margin-top: 20px;
  padding: 12px 20px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.login-notice p {
  margin: 0;
  color: #856404;
  font-size: 0.9rem;
  font-weight: 500;
}

.fund-categories {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 50px;
}

.fund-category-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px 24px;
  border-radius: 16px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.fund-category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.3);
}

.category-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.fund-category-card h3 {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.fund-category-card p {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 16px;
  line-height: 1.5;
}

.fund-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  display: inline-block;
}

.fund-performance {
  margin-bottom: 50px;
}

.fund-performance h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 24px;
  text-align: center;
}

.performance-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.performance-table table {
  width: 100%;
  border-collapse: collapse;
}

.performance-table th,
.performance-table td {
  padding: 16px 20px;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

.performance-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.performance-table tr:hover {
  background: #f8f9fa;
}

.positive {
  color: #27ae60;
  font-weight: 600;
}

.fund-allocation {
  text-align: center;
}

.fund-allocation h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 24px;
}

.allocation-chart {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 60px 20px;
}

.chart-placeholder {
  color: #7f8c8d;
}

.chart-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.chart-placeholder p {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #2c3e50;
}

.chart-placeholder span {
  font-size: 1rem;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .fund-categories {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .section-header h1 {
    font-size: 2rem;
  }
  
  .performance-table {
    overflow-x: auto;
  }
  
  .performance-table table {
    min-width: 600px;
  }
}
</style> 
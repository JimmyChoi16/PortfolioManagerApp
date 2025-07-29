<template>
  <div class="bond-section">
    <!-- Login Warning -->
    <div v-if="!isLoggedIn" class="login-warning">
      <el-alert
        title="⚠️ You are not logged in. All data shown is for demonstration purposes only."
        type="warning"
        :closable="false"
        show-icon
      />
    </div>

    <!-- Header -->
    <div class="section-header">
      <h1>Bond Portfolio</h1>
      <p>Manage your fixed income investments with comprehensive bond analysis</p>
    </div>

    <!-- Bond Types Overview -->
    <div class="card-grid-4">
      <div class="gradient-card green">
        <div class="card-icon">🏛️</div>
        <h3>Government Bonds</h3>
        <p>U.S. Treasury securities with guaranteed returns</p>
        <div class="metrics">
          <div class="metric">
            <span class="label">Yield</span>
            <span class="value">4.25%</span>
          </div>
          <div class="metric">
            <span class="label">Duration</span>
            <span class="value">7.2 years</span>
          </div>
        </div>
      </div>
      
      <div class="gradient-card green">
        <div class="card-icon">🏢</div>
        <h3>Corporate Bonds</h3>
        <p>Investment-grade corporate debt securities</p>
        <div class="metrics">
          <div class="metric">
            <span class="label">Yield</span>
            <span class="value">5.8%</span>
          </div>
          <div class="metric">
            <span class="label">Duration</span>
            <span class="value">5.1 years</span>
          </div>
        </div>
      </div>
      
      <div class="gradient-card green">
        <div class="card-icon">🏘️</div>
        <h3>Municipal Bonds</h3>
        <p>Tax-advantaged state and local government debt</p>
        <div class="metrics">
          <div class="metric">
            <span class="label">Yield</span>
            <span class="value">3.9%</span>
          </div>
          <div class="metric">
            <span class="label">Duration</span>
            <span class="value">8.5 years</span>
          </div>
        </div>
      </div>
      
      <div class="gradient-card green">
        <div class="card-icon">🌍</div>
        <h3>International Bonds</h3>
        <p>Global fixed income diversification</p>
        <div class="metrics">
          <div class="metric">
            <span class="label">Yield</span>
            <span class="value">3.2%</span>
          </div>
          <div class="metric">
            <span class="label">Duration</span>
            <span class="value">6.8 years</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bond Holdings Table -->
     <!-- TODO: Need to change to mock data, will show the real after login sucessfully -->
    <div class="bond-holdings">
      <h2>Current Bond Holdings</h2>
      <div class="holdings-table">
        <table>
          <thead>
            <tr>
              <th>Bond Name</th>
              <th>Ticker</th>
              <th>Type</th>
              <th>Face Value</th>
              <th>Coupon Rate</th>
              <th>Maturity</th>
              <th>Current Yield</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>U.S. Treasury 10-Year</td>
              <td>UST10Y</td>
              <td>Government</td>
              <td>$50,000</td>
              <td>4.25%</td>
              <td>2034-05-15</td>
              <td class="positive">4.28%</td>
            </tr>
            <tr>
              <td>Apple Inc. 5-Year</td>
              <td>AAPL5Y</td>
              <td>Corporate</td>
              <td>$25,000</td>
              <td>3.85%</td>
              <td>2029-03-15</td>
              <td class="positive">4.12%</td>
            </tr>
            <tr>
              <td>California Muni 7-Year</td>
              <td>CAMUNI7</td>
              <td>Municipal</td>
              <td>$30,000</td>
              <td>3.45%</td>
              <td>2031-08-20</td>
              <td class="positive">3.52%</td>
            </tr>
            <tr>
              <td>German Bund 5-Year</td>
              <td>DEBUND5</td>
              <td>International</td>
              <td>€20,000</td>
              <td>2.15%</td>
              <td>2029-12-10</td>
              <td class="positive">2.18%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Yield Curve -->
    <div class="yield-curve">
      <h2>Yield Curve Analysis</h2>
      <div class="curve-chart">
        <div class="chart-placeholder">
          <div class="chart-icon">📊</div>
          <p>Yield Curve Chart</p>
          <span>Interactive yield curve showing current market rates</span>
        </div>
      </div>
    </div>

    <!-- Bond Ladder -->
    <div class="bond-ladder">
      <h2>Bond Ladder Strategy</h2>
      <div class="ladder-visualization">
        <div class="ladder-step">
          <div class="step-number">1</div>
          <div class="step-info">
            <h4>Short-term (1-3 years)</h4>
            <p>$100,000 maturing annually</p>
          </div>
        </div>
        <div class="ladder-step">
          <div class="step-number">2</div>
          <div class="step-info">
            <h4>Medium-term (4-7 years)</h4>
            <p>$150,000 providing stability</p>
          </div>
        </div>
        <div class="ladder-step">
          <div class="step-number">3</div>
          <div class="step-info">
            <h4>Long-term (8-10 years)</h4>
            <p>$200,000 for higher yields</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isLoggedIn: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.bond-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* Component-specific styles only */

.bond-holdings {
  margin-bottom: 50px;
}

.bond-holdings h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 24px;
  text-align: center;
}

.holdings-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.holdings-table table {
  width: 100%;
  border-collapse: collapse;
}

.holdings-table th,
.holdings-table td {
  padding: 16px 20px;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

.holdings-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.holdings-table tr:hover {
  background: #f8f9fa;
}

.positive {
  color: #27ae60;
  font-weight: 600;
}

.yield-curve {
  margin-bottom: 50px;
  text-align: center;
}

.yield-curve h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 24px;
}

.curve-chart {
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

.bond-ladder {
  text-align: center;
}

.bond-ladder h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 32px;
}

.ladder-visualization {
  display: flex;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
}

.ladder-step {
  background: linear-gradient(135deg, #fceabb 0%, #f8b500 100%);
  padding: 24px 20px;
  border-radius: 12px;
  min-width: 200px;
  text-align: center;
  transition: transform 0.3s ease;
}

.ladder-step:hover {
  transform: translateY(-4px);
}

.step-number {
  width: 40px;
  height: 40px;
  background: #2c3e50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin: 0 auto 16px;
}

.step-info h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.step-info p {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin: 0;
}

@media (max-width: 768px) {
  .bond-types {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .section-header h1 {
    font-size: 2rem;
  }
  
  .holdings-table {
    overflow-x: auto;
  }
  
  .holdings-table table {
    min-width: 700px;
  }
  
  .ladder-visualization {
    flex-direction: column;
    align-items: center;
  }
}
</style> 
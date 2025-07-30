<template>
  <div class="cash-section">
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
      <h1>Cash Management</h1>
      <p>Optimize your cash positions with high-yield accounts and smart liquidity management</p>
    </div>

    <!-- Cash Accounts Overview -->
     <!-- TODO: Need to change to mock data, will show the real after login sucessfully -->
    <div class="card-grid-4">
      <div class="gradient-card green">
        <div class="card-icon">
          <img class="cash-icon-img" src="@/assets/govern.png" alt="High-Yield Savings" />
        </div>
        <h3>High-Yield Savings</h3>
        <p>Earn competitive interest on your emergency fund</p>
        <div class="metrics">
          <div class="metric">
            <span class="label">Balance</span>
            <span class="value">$25,000</span>
          </div>
          <div class="metric">
            <span class="label">APY</span>
            <span class="value">4.25%</span>
          </div>
        </div>
      </div>
      
      <div class="gradient-card green">
        <div class="card-icon">
          <img class="cash-icon-img" src="@/assets/card.png" alt="Checking Account" />
        </div>
        <h3>Checking Account</h3>
        <p>Daily transactions and bill payments</p>
        <div class="metrics">
          <div class="metric">
            <span class="label">Balance</span>
            <span class="value">$8,500</span>
          </div>
          <div class="metric">
            <span class="label">APY</span>
            <span class="value">0.05%</span>
          </div>
        </div>
      </div>
      
      <div class="gradient-card green">
        <div class="card-icon">
          <img class="cash-icon-img" src="@/assets/line_chart.png" alt="Money Market" />
        </div>
        <h3>Money Market</h3>
        <p>Higher yields with check-writing privileges</p>
        <div class="metrics">
          <div class="metric">
            <span class="label">Balance</span>
            <span class="value">$15,000</span>
          </div>
          <div class="metric">
            <span class="label">APY</span>
            <span class="value">4.85%</span>
          </div>
        </div>
      </div>
      
      <div class="gradient-card green">
        <div class="card-icon">
          <img class="cash-icon-img" src="@/assets/earth.png" alt="Foreign Currency" />
        </div>
        <h3>Foreign Currency</h3>
        <p>Multi-currency accounts for international exposure</p>
        <div class="metrics">
          <div class="metric">
            <span class="label">Balance</span>
            <span class="value">€5,000</span>
          </div>
          <div class="metric">
            <span class="label">APY</span>
            <span class="value">2.15%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Cash Flow Analysis -->
    <div class="cash-flow">
      <h2>Cash Flow Analysis</h2>
      <div class="flow-summary">
        <div class="flow-item income">
          <div class="flow-icon">
            <img class="flow-icon-img" src="@/assets/money.png" alt="Monthly Income" />
            <div class="flow-divider"></div>
          </div>
          <div class="flow-details">
            <h4>Monthly Income</h4>
            <p class="amount positive">+$8,500</p>
            <span class="description">Salary, dividends, interest</span>
          </div>
        </div>
        
        <div class="flow-item expenses">
          <div class="flow-icon">
            <img class="flow-icon-img" src="@/assets/cash.png" alt="Monthly Expenses" />
            <div class="flow-divider"></div>
          </div>
          <div class="flow-details">
            <h4>Monthly Expenses</h4>
            <p class="amount negative">-$4,200</p>
            <span class="description">Bills, groceries, entertainment</span>
          </div>
        </div>
        
        <div class="flow-item savings">
          <div class="flow-icon">
            <img class="flow-icon-img" src="@/assets/bar_chart.png" alt="Net Savings" />
            <div class="flow-divider"></div>
          </div>
          <div class="flow-details">
            <h4>Net Savings</h4>
            <p class="amount positive">+$4,300</p>
            <span class="description">Available for investment</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Interest Rate Comparison -->
    <div class="interest-comparison">
      <h2>Interest Rate Comparison</h2>
      <div class="comparison-table">
        <table>
          <thead>
            <tr>
              <th>Account Type</th>
              <th>Current APY</th>
              <th>Minimum Balance</th>
              <th>Monthly Fee</th>
              <th>FDIC Insured</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>High-Yield Savings</td>
              <td class="positive">4.25%</td>
              <td>$0</td>
              <td>$0</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>Money Market</td>
              <td class="positive">4.85%</td>
              <td>$2,500</td>
              <td>$0</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>Traditional Savings</td>
              <td>0.01%</td>
              <td>$300</td>
              <td>$5</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>Checking Account</td>
              <td>0.05%</td>
              <td>$1,500</td>
              <td>$0</td>
              <td>Yes</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Emergency Fund Calculator -->
    <div class="emergency-fund">
      <h2>Emergency Fund Calculator</h2>
      <div class="calculator">
        <div class="calc-inputs">
          <div class="input-group">
            <label>Monthly Expenses</label>
            <input type="number" value="4200" class="calc-input" />
          </div>
          <div class="input-group">
            <label>Target Months</label>
            <select class="calc-select">
              <option value="3">3 months</option>
              <option value="6" selected>6 months</option>
              <option value="9">9 months</option>
              <option value="12">12 months</option>
            </select>
          </div>
        </div>
        <div class="calc-result">
          <h3>Recommended Emergency Fund</h3>
          <p class="result-amount">$25,200</p>
          <span class="result-note">Based on 6 months of expenses</span>
        </div>
      </div>
    </div>

    <!-- Cash Allocation Chart -->
    <div class="cash-allocation">
      <h2>Cash Allocation</h2>
      <div class="allocation-chart">
        <div class="chart-placeholder">
          <div class="chart-icon">📊</div>
          <p>Cash Allocation Chart</p>
          <span>Visual breakdown of your cash across different accounts</span>
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
.cash-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.cash-accounts {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 50px;
}

.account-card {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
  padding: 32px 24px;
  border-radius: 16px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.account-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(17, 153, 142, 0.3);
}

.account-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.account-card h3 {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.account-card p {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 20px;
  line-height: 1.5;
}

.account-metrics {
  display: flex;
  justify-content: space-around;
  gap: 16px;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.metric .label {
  font-size: 0.85rem;
  opacity: 0.8;
  margin-bottom: 4px;
}

.metric .value {
  font-size: 1.2rem;
  font-weight: 700;
}

.cash-flow {
  margin-bottom: 50px;
}

.cash-flow h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 32px;
  text-align: center;
}

.flow-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.flow-item {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.3s ease;
}

.flow-item:hover {
  transform: translateY(-4px);
}

.flow-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flow-icon-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
  display: block;
}
.flow-divider {
  width: 1.5px;
  height: 40px;
  background: #e0e0e0;
  margin-left: 12px;
  align-self: center;
  display: inline-block;
}

.flow-details h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.amount {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.amount.positive {
  color: #27ae60;
}

.amount.negative {
  color: #e74c3c;
}

.description {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.interest-comparison {
  margin-bottom: 50px;
}

.interest-comparison h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 24px;
  text-align: center;
}

.comparison-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.comparison-table table {
  width: 100%;
  border-collapse: collapse;
}

.comparison-table th,
.comparison-table td {
  padding: 16px 20px;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

.comparison-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.comparison-table tr:hover {
  background: #f8f9fa;
}

.positive {
  color: #27ae60;
  font-weight: 600;
}

.emergency-fund {
  margin-bottom: 50px;
  text-align: center;
}

.emergency-fund h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 32px;
}

.calculator {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 40px;
  max-width: 600px;
  margin: 0 auto;
}

.calc-inputs {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
  justify-content: center;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-weight: 600;
  color: #2c3e50;
}

.calc-input,
.calc-select {
  padding: 12px 16px;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.calc-input:focus,
.calc-select:focus {
  outline: none;
  border-color: #667eea;
}

.calc-result {
  text-align: center;
}

.calc-result h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
}

.result-amount {
  font-size: 2.5rem;
  font-weight: 700;
  color: #27ae60;
  margin-bottom: 8px;
}

.result-note {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.cash-allocation {
  text-align: center;
}

.cash-allocation h2 {
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

.cash-icon-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  display: block;
  margin: 0 auto 8px auto;
  filter: brightness(0) invert(1);
}

@media (max-width: 768px) {
  .cash-accounts {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .section-header h1 {
    font-size: 2rem;
  }
  
  .flow-summary {
    grid-template-columns: 1fr;
  }
  
  .calc-inputs {
    flex-direction: column;
    align-items: center;
  }
  
  .comparison-table {
    overflow-x: auto;
  }
  
  .comparison-table table {
    min-width: 600px;
  }
}
</style> 
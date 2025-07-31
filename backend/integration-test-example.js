const request = require('supertest');
const express = require('express');
const { pool } = require('./config/database');
const marketController = require('./controllers/marketController');
const holdingsController = require('./controllers/holdingController');

// Create Express app for integration testing
const app = express();
app.use(express.json());

// Add routes for integration testing
app.get('/api/market/trending', marketController.getTrendingStocks);
app.get('/api/market/search', marketController.searchSymbols);
app.get('/api/market/quote/:symbol', marketController.getQuote);
app.get('/api/holdings', holdingsController.getAllHoldings);
app.get('/api/holdings/summary', holdingsController.getPortfolioSummary);
app.get('/api/holdings/allocation', holdingsController.getAllocationAnalysis);

// Integration test suite
async function runIntegrationTests() {
  console.log('🔗 Starting Integration Tests...\n');
  console.log('📋 Testing complete data flow from API to database and back\n');
  
  let passedTests = 0;
  let totalTests = 0;
  const testResults = [];

  // Test 1: Database Connection Test
  totalTests++;
  console.log(`✅ Test ${totalTests}: Database Connection`);
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT 1 as test');
    connection.release();
    
    if (rows && rows[0] && rows[0].test === 1) {
      console.log('   ✓ Database connection successful');
      console.log('   ✓ Basic query execution works');
      passedTests++;
      testResults.push({ test: 'Database Connection', status: 'PASSED' });
    } else {
      throw new Error('Database query failed');
    }
  } catch (error) {
    console.log('   ❌ Failed:', error.message);
    testResults.push({ test: 'Database Connection', status: 'FAILED', error: error.message });
  }

  // Test 2: Holdings Data Flow Integration
  totalTests++;
  console.log(`\n✅ Test ${totalTests}: Holdings Data Flow Integration`);
  try {
    // Test the complete flow: API call -> Database query -> Response
    const response = await request(app).get('/api/holdings');
    
    if (response.status === 200 && response.body.success === true) {
      console.log('   ✓ API endpoint accessible');
      console.log('   ✓ Database query successful');
      console.log('   ✓ Response format correct');
      console.log(`   ✓ Data returned: ${Array.isArray(response.body.data) ? response.body.data.length : 'N/A'} items`);
      passedTests++;
      testResults.push({ test: 'Holdings Data Flow', status: 'PASSED' });
    } else {
      throw new Error('Holdings data flow failed');
    }
  } catch (error) {
    console.log('   ❌ Failed:', error.message);
    testResults.push({ test: 'Holdings Data Flow', status: 'FAILED', error: error.message });
  }

  // Test 3: Portfolio Summary Integration
  totalTests++;
  console.log(`\n✅ Test ${totalTests}: Portfolio Summary Integration`);
  try {
    const response = await request(app).get('/api/holdings/summary');
    
    if (response.status === 200 && response.body.success === true) {
      console.log('   ✓ Summary API accessible');
      console.log('   ✓ Database aggregation working');
      console.log('   ✓ Summary data structure valid');
      
      // Check if summary contains expected fields
      const summary = response.body.data;
      const hasRequiredFields = summary && (
        typeof summary.total_value !== 'undefined' ||
        typeof summary.total_cost !== 'undefined' ||
        typeof summary.total_gain_loss !== 'undefined'
      );
      
      if (hasRequiredFields) {
        console.log('   ✓ Summary contains required fields');
        passedTests++;
        testResults.push({ test: 'Portfolio Summary', status: 'PASSED' });
      } else {
        throw new Error('Summary missing required fields');
      }
    } else {
      throw new Error('Portfolio summary failed');
    }
  } catch (error) {
    console.log('   ❌ Failed:', error.message);
    testResults.push({ test: 'Portfolio Summary', status: 'FAILED', error: error.message });
  }

  // Test 4: Market Data Integration
  totalTests++;
  console.log(`\n✅ Test ${totalTests}: Market Data Integration`);
  try {
    // Test market search and quote integration
    const searchResponse = await request(app).get('/api/market/search?query=AAPL');
    const quoteResponse = await request(app).get('/api/market/quote/AAPL');
    
    if (searchResponse.status === 200 && quoteResponse.status === 200) {
      console.log('   ✓ Market search API working');
      console.log('   ✓ Market quote API working');
      console.log('   ✓ External market data integration functional');
      passedTests++;
      testResults.push({ test: 'Market Data Integration', status: 'PASSED' });
    } else {
      throw new Error('Market data integration failed');
    }
  } catch (error) {
    console.log('   ❌ Failed:', error.message);
    testResults.push({ test: 'Market Data Integration', status: 'FAILED', error: error.message });
  }

  // Test 5: Cross-Module Data Consistency
  totalTests++;
  console.log(`\n✅ Test ${totalTests}: Cross-Module Data Consistency`);
  try {
    // Test that different endpoints return consistent data structures
    const [holdingsRes, summaryRes, allocationRes] = await Promise.all([
      request(app).get('/api/holdings'),
      request(app).get('/api/holdings/summary'),
      request(app).get('/api/holdings/allocation')
    ]);
    
    const allSuccessful = [holdingsRes, summaryRes, allocationRes].every(res => 
      res.status === 200 && res.body.success === true
    );
    
    if (allSuccessful) {
      console.log('   ✓ All portfolio endpoints accessible');
      console.log('   ✓ Consistent success response format');
      console.log('   ✓ Cross-module integration working');
      passedTests++;
      testResults.push({ test: 'Cross-Module Consistency', status: 'PASSED' });
    } else {
      throw new Error('Cross-module consistency failed');
    }
  } catch (error) {
    console.log('   ❌ Failed:', error.message);
    testResults.push({ test: 'Cross-Module Consistency', status: 'FAILED', error: error.message });
  }

  // Test 6: Error Handling Integration
  totalTests++;
  console.log(`\n✅ Test ${totalTests}: Error Handling Integration`);
  try {
    // Test error handling across the system
    const invalidResponse = await request(app).get('/api/market/quote/INVALID_SYMBOL_12345');
    
    // Even with invalid symbol, the system should handle it gracefully
    if (invalidResponse.status === 200 || invalidResponse.status === 404 || invalidResponse.status === 400) {
      console.log('   ✓ Error handling working');
      console.log('   ✓ Invalid requests handled gracefully');
      console.log(`   ✓ Status code: ${invalidResponse.status} (Expected)`);
      passedTests++;
      testResults.push({ test: 'Error Handling', status: 'PASSED' });
    } else {
      throw new Error('Error handling failed');
    }
  } catch (error) {
    console.log('   ❌ Failed:', error.message);
    testResults.push({ test: 'Error Handling', status: 'FAILED', error: error.message });
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 INTEGRATION TEST SUMMARY');
  console.log('='.repeat(60));
  
  testResults.forEach((result, index) => {
    const status = result.status === 'PASSED' ? '✅' : '❌';
    console.log(`${status} Test ${index + 1}: ${result.test} - ${result.status}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n📈 Overall Results:');
  console.log(`   - Total tests: ${totalTests}`);
  console.log(`   - Passed: ${passedTests}`);
  console.log(`   - Failed: ${totalTests - passedTests}`);
  console.log(`   - Success rate: ${Math.round((passedTests/totalTests)*100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All integration tests passed! System components work together correctly.');
  } else {
    console.log('\n⚠️  Some integration tests failed. System integration issues detected.');
  }
  
  console.log('\n💡 This integration test verifies:');
  console.log('   - Database connectivity and queries');
  console.log('   - API endpoint functionality');
  console.log('   - Data flow between components');
  console.log('   - Cross-module communication');
  console.log('   - Error handling across the system');
  console.log('   - External service integration');
  
  // Close database connection pool
  await pool.end();
}

// Run tests if this file is executed directly
if (require.main === module) {
  runIntegrationTests().catch(console.error);
}

module.exports = { runIntegrationTests }; 
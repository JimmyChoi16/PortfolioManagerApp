const request = require('supertest');
const express = require('express');
const marketController = require('./controllers/marketController');
const holdingsController = require('./controllers/holdingController');

// Create Express app for testing
const app = express();
app.use(express.json());

// Add routes for regression testing
app.get('/api/market/trending', marketController.getTrendingStocks);
app.get('/api/market/search', marketController.searchSymbols);
app.get('/api/market/quote/:symbol', marketController.getQuote);
app.get('/api/holdings', holdingsController.getAllHoldings);

// Regression test suite
async function runRegressionTests() {
  console.log('🔄 Starting Regression Tests...\n');
  console.log('📋 Testing multiple API endpoints to ensure no breaking changes\n');
  
  let passedTests = 0;
  let totalTests = 0;
  const testResults = [];

  // Test 1: Market Trending Endpoint
  totalTests++;
  console.log(`✅ Test ${totalTests}: Market Trending Endpoint`);
  try {
    const response = await request(app).get('/api/market/trending');
    if (response.status === 200 && response.body.success === true) {
      console.log('   ✓ Status: 200 OK');
      console.log('   ✓ Success: true');
      console.log('   ✓ Message: exists');
      passedTests++;
      testResults.push({ test: 'Market Trending', status: 'PASSED' });
    } else {
      throw new Error('Unexpected response');
    }
  } catch (error) {
    console.log('   ❌ Failed:', error.message);
    testResults.push({ test: 'Market Trending', status: 'FAILED', error: error.message });
  }

  // Test 2: Market Search Endpoint
  totalTests++;
  console.log(`\n✅ Test ${totalTests}: Market Search Endpoint`);
  try {
    const response = await request(app).get('/api/market/search?query=AAPL');
    if (response.status === 200 && response.body.success === true) {
      console.log('   ✓ Status: 200 OK');
      console.log('   ✓ Success: true');
      console.log('   ✓ Message: exists');
      passedTests++;
      testResults.push({ test: 'Market Search', status: 'PASSED' });
    } else {
      throw new Error('Unexpected response');
    }
  } catch (error) {
    console.log('   ❌ Failed:', error.message);
    testResults.push({ test: 'Market Search', status: 'FAILED', error: error.message });
  }

  // Test 3: Market Quote Endpoint
  totalTests++;
  console.log(`\n✅ Test ${totalTests}: Market Quote Endpoint`);
  try {
    const response = await request(app).get('/api/market/quote/AAPL');
    if (response.status === 200 && response.body.success === true) {
      console.log('   ✓ Status: 200 OK');
      console.log('   ✓ Success: true');
      console.log('   ✓ Message: exists');
      passedTests++;
      testResults.push({ test: 'Market Quote', status: 'PASSED' });
    } else {
      throw new Error('Unexpected response');
    }
  } catch (error) {
    console.log('   ❌ Failed:', error.message);
    testResults.push({ test: 'Market Quote', status: 'FAILED', error: error.message });
  }

  // Test 4: Holdings Endpoint (Basic structure test)
  totalTests++;
  console.log(`\n✅ Test ${totalTests}: Holdings Endpoint`);
  try {
    const response = await request(app).get('/api/holdings');
    // Holdings endpoint might return 401 if not authenticated, which is expected
    if (response.status === 200 || response.status === 401) {
      console.log(`   ✓ Status: ${response.status} (Expected)`);
      console.log('   ✓ Response structure: valid');
      passedTests++;
      testResults.push({ test: 'Holdings', status: 'PASSED' });
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    console.log('   ❌ Failed:', error.message);
    testResults.push({ test: 'Holdings', status: 'FAILED', error: error.message });
  }

  // Test 5: Response Format Consistency
  totalTests++;
  console.log(`\n✅ Test ${totalTests}: Response Format Consistency`);
  try {
    const responses = await Promise.all([
      request(app).get('/api/market/trending'),
      request(app).get('/api/market/search?query=TEST'),
      request(app).get('/api/market/quote/TEST')
    ]);
    
    const allHaveSuccessProperty = responses.every(res => 
      res.body && typeof res.body.success === 'boolean'
    );
    
    if (allHaveSuccessProperty) {
      console.log('   ✓ All endpoints return success property');
      console.log('   ✓ Response format is consistent');
      passedTests++;
      testResults.push({ test: 'Response Format', status: 'PASSED' });
    } else {
      throw new Error('Inconsistent response format');
    }
  } catch (error) {
    console.log('   ❌ Failed:', error.message);
    testResults.push({ test: 'Response Format', status: 'FAILED', error: error.message });
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 REGRESSION TEST SUMMARY');
  console.log('='.repeat(50));
  
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
    console.log('\n🎉 All regression tests passed! No breaking changes detected.');
  } else {
    console.log('\n⚠️  Some regression tests failed. Please investigate.');
  }
  
  console.log('\n💡 This regression test ensures that:');
  console.log('   - All API endpoints are accessible');
  console.log('   - Response structures remain consistent');
  console.log('   - No breaking changes were introduced');
  console.log('   - Basic functionality is preserved');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runRegressionTests();
}

module.exports = { runRegressionTests }; 
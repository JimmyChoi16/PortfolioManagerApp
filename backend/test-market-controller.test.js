const request = require('supertest');
const express = require('express');
const marketController = require('./controllers/marketController');

// Create a simple Express app for testing
const app = express();
app.use(express.json());

// Add the route we want to test
app.get('/api/market/trending', marketController.getTrendingStocks);

// Simple test runner
async function runTests() {
  console.log('🧪 Starting Market Controller Tests...\n');
  
  let passedTests = 0;
  let totalTests = 3;
  
  try {
    // Test 1: Basic response structure
    console.log('✅ Test 1: Checking response structure...');
    const response = await request(app).get('/api/market/trending');
    
    if (response.status === 200 && 
        response.body.success === true && 
        response.body.message) {
      console.log('   ✓ Response status: 200');
      console.log('   ✓ Success property: true');
      console.log('   ✓ Message property: exists');
      passedTests++;
    } else {
      throw new Error('Response structure is incorrect');
    }

    // Test 2: Message content
    console.log('\n✅ Test 2: Checking message content...');
    if (response.body.message === 'Trending stocks functionality is currently unavailable.') {
      console.log('   ✓ Message content is correct');
      passedTests++;
    } else {
      throw new Error('Message content is incorrect');
    }

    // Test 3: Content type
    console.log('\n✅ Test 3: Checking content type...');
    if (response.headers['content-type'].includes('application/json')) {
      console.log('   ✓ Content type is application/json');
      passedTests++;
    } else {
      throw new Error('Content type is not application/json');
    }

    console.log('\n🎉 All tests passed successfully!');
    console.log('\n📊 Test Summary:');
    console.log(`   - Total tests: ${totalTests}`);
    console.log(`   - Passed: ${passedTests}`);
    console.log('   - Failed: 0');
    console.log(`   - Success rate: ${Math.round((passedTests/totalTests)*100)}%`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n📊 Test Summary:');
    console.log(`   - Total tests: ${totalTests}`);
    console.log(`   - Passed: ${passedTests}`);
    console.log(`   - Failed: ${totalTests - passedTests}`);
    console.log(`   - Success rate: ${Math.round((passedTests/totalTests)*100)}%`);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests }; 
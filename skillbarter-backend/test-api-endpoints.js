const axios = require('axios');

async function testAPIEndpoints() {
  try {
    console.log('🧪 Testing SkillBarter API Endpoints...\n');

    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    try {
      const healthResponse = await axios.get('http://localhost:5000/health');
      console.log('✅ Health check:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
      console.log('⚠️  Make sure the backend server is running on port 5000');
      return;
    }

    // Test 2: Check if users route exists (without auth)
    console.log('\n2️⃣ Testing users route accessibility...');
    try {
      const usersResponse = await axios.get('http://localhost:5000/api/users/all');
      console.log('❌ Users route is accessible without auth (this should fail)');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Users route exists but requires authentication (correct behavior)');
      } else if (error.response && error.response.status === 404) {
        console.log('❌ Users route not found - check if routes are properly registered');
      } else {
        console.log('⚠️  Unexpected error:', error.message);
      }
    }

    // Test 3: Check skills route
    console.log('\n3️⃣ Testing skills route...');
    try {
      const skillsResponse = await axios.get('http://localhost:5000/api/skills/all');
      console.log('✅ Skills route accessible:', skillsResponse.data.success ? 'Success' : 'Failed');
    } catch (error) {
      console.log('❌ Skills route failed:', error.message);
    }

    // Test 4: Check auth route
    console.log('\n4️⃣ Testing auth route...');
    try {
      const authResponse = await axios.get('http://localhost:5000/api/auth/me');
      console.log('❌ Auth route accessible without token (this should fail)');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Auth route exists but requires authentication (correct behavior)');
      } else {
        console.log('❌ Auth route error:', error.message);
      }
    }

    console.log('\n📋 Summary:');
    console.log('- If health check fails: Start the backend server');
    console.log('- If users route not found: Check server logs for startup errors');
    console.log('- If skills route fails: Check database connection');

  } catch (error) {
    console.error('🚨 Test script error:', error.message);
  }
}

// Run the test
testAPIEndpoints();
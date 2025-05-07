import fetch from 'node-fetch';

// Configuration for API endpoints
const API_BASE_URL = 'https://factifyai.onrender.com';
const API_ENDPOINTS = {
  textAnalysis: `${API_BASE_URL}/analyze/text`,
  imageAnalysis: `${API_BASE_URL}/analyze/image`,
  healthCheck: `${API_BASE_URL}/analyze/health`
};

// Test the health endpoint
async function testHealthEndpoint() {
  console.log('Testing backend health endpoint...');
  try {
    const response = await fetch(API_ENDPOINTS.healthCheck, {
      method: 'GET'
    });
    
    if (response.ok) {
      console.log('✅ Backend health check successful! Status:', response.status);
      return true;
    } else {
      console.log('❌ Backend health check failed. Status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Error connecting to backend:', error.message);
    console.log('Make sure your backend is running at', API_BASE_URL);
    return false;
  }
}

// Test the text analysis endpoint with a sample request
async function testTextAnalysis() {
  console.log('\nTesting text analysis endpoint...');
  
  const testData = {
    text: "The earth is flat and the moon landing was fake.",
    enableOptions: { factCheck: true, sentimentAnalysis: false },
    apikey: "YOUR_API_KEY_HERE", // Replace with your actual API key for a real test
    model: "default-model"
  };
  
  try {
    const response = await fetch(API_ENDPOINTS.textAnalysis, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    if (response.ok) {
      const data = await response.text();
      console.log('✅ Text analysis request successful!');
      console.log('Response:', data.substring(0, 150) + (data.length > 150 ? '...' : ''));
      return true;
    } else {
      console.log('❌ Text analysis request failed. Status:', response.status);
      if (response.status === 400) {
        console.log('   This might be due to an invalid API key or missing required fields.');
      }
      return false;
    }
  } catch (error) {
    console.log('❌ Error making text analysis request:', error.message);
    return false;
  }
}

// Run the tests
async function runTests() {
  console.log('🧪 Testing FactifyAI Extension Backend Communication\n');
  
  const healthCheckResult = await testHealthEndpoint();
  
  if (healthCheckResult) {
    await testTextAnalysis();
  }
  
  console.log('\n🔍 Testing Complete!');
  console.log('To fully test the extension UI and interactions, you\'ll need to load it in Chrome');
}

runTests();
// Background script for the FactifyAI Chrome extension
// This script handles communication between the content script and popup

// Configuration for API endpoints
const API_BASE_URL = 'https://factifyai.onrender.com';
const API_ENDPOINTS = {
  textAnalysis: `${API_BASE_URL}/analyze/text`,
  imageAnalysis: `${API_BASE_URL}/analyze/image`,
  healthCheck: `${API_BASE_URL}/analyze/health`
};

// Enable verbose logging for debugging
const DEBUG = true;

// Logger helper
function log(...args: any[]): void {
  if (DEBUG) {
    console.log('[FactifyAI Background]', ...args);
  }
}

// Define types for request data
interface TextAnalysisRequest {
  text: string;
  enableOptions: Record<string, boolean>;
  apikey: string;
  model: string;
}

interface ImageAnalysisRequest {
  imageData: Blob;
  apikey: string;
  model: string;
  text: string;
}

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request: any, _sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
  log('Received message:', request);
  
  if (request.action === 'analyzeText') {
    log('Analyzing text:', request.data.text.substring(0, 50) + '...');
    analyzeText(request.data)
      .then(result => {
        log('Analysis successful, sending response');
        sendResponse({ success: true, data: result });
      })
      .catch(error => {
        log('Analysis failed:', error.message);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Required to use sendResponse asynchronously
  }
  
  if (request.action === 'analyzeImage') {
    log('Analyzing image');
    analyzeImage(request.data)
      .then(result => {
        log('Image analysis successful');
        sendResponse({ success: true, data: result });
      })
      .catch(error => {
        log('Image analysis failed:', error.message);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
  
  if (request.action === 'checkHealth') {
    log('Checking backend health');
    checkHealth()
      .then(result => {
        log('Health check result:', result);
        sendResponse({ success: true, data: result });
      })
      .catch(error => {
        log('Health check failed:', error.message);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

// Function to analyze text
async function analyzeText(data: TextAnalysisRequest): Promise<string> {
  const { text, enableOptions, apikey, model } = data;
  
  log('Sending request to', API_ENDPOINTS.textAnalysis);
  log('Request payload:', { text: text.substring(0, 50) + '...', enableOptions, model });
  
  try {
    const response = await fetch(API_ENDPOINTS.textAnalysis, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        text,
        enableOptions,
        apikey,
        model
      })
    });
    
    log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      log('Error response:', errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    const responseText = await response.text();
    log('Response data:', responseText.substring(0, 100) + '...');
    return responseText;
  } catch (error) {
    log('Fetch error:', error);
    throw error;
  }
}

// Function to analyze image
async function analyzeImage(data: ImageAnalysisRequest): Promise<string> {
  const { imageData, apikey, model, text } = data;
  
  log('Sending image analysis request');
  
  try {
    const formData = new FormData();
    formData.append('file', imageData);
    formData.append('apikey', apikey);
    formData.append('model', model);
    formData.append('text', text);
    
    const response = await fetch(API_ENDPOINTS.imageAnalysis, {
      method: 'POST',
      body: formData
    });
    
    log('Image analysis response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      log('Error response:', errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    const responseText = await response.text();
    log('Response data:', responseText.substring(0, 100) + '...');
    return responseText;
  } catch (error) {
    log('Fetch error:', error);
    throw error;
  }
}

// Function to check API health
async function checkHealth(): Promise<boolean> {
  log('Sending health check request');
  
  try {
    const response = await fetch(API_ENDPOINTS.healthCheck, {
      method: 'GET'
    });
    
    log('Health check response status:', response.status);
    return response.ok;
  } catch (error) {
    log('Health check error:', error);
    throw error;
  }
}

log('FactifyAI background script loaded');
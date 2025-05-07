// Utility functions for FactifyAI Chrome extension

// API endpoint configuration
export const API_CONFIG = {
  baseUrl: 'https://factifyai.onrender.com',
  endpoints: {
    textAnalysis: '/analyze/text',
    imageAnalysis: '/analyze/image',
    healthCheck: '/analyze/health'
  }
};

// Storage helper interfaces
export interface Settings {
  apiKey: string;
  model: string;
  enableOptions: EnableOptions;
}

export interface EnableOptions {
  factCheck: boolean;
  sentimentAnalysis: boolean;
  [key: string]: boolean;
}

// Storage helper functions
export const StorageHelper = {
  // Get stored values with default fallbacks
  async getStoredValue<T>(key: string, defaultValue: T | null = null): Promise<T | null> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([key], (result: { [key: string]: any }) => {
        resolve(result[key] !== undefined ? result[key] : defaultValue);
      });
    });
  },

  // Store a value in Chrome storage
  async setStoredValue<T>(key: string, value: T): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [key]: value }, () => {
        resolve();
      });
    });
  },

  // Get all settings at once
  async getSettings(): Promise<Settings> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['apiKey', 'model', 'enableOptions'], (result: {
        apiKey?: string;
        model?: string;
        enableOptions?: EnableOptions;
      }) => {
        resolve({
          apiKey: result.apiKey || '',
          model: result.model || 'default-model',
          enableOptions: result.enableOptions || { factCheck: true, sentimentAnalysis: false }
        });
      });
    });
  }
};

// Message interface
export interface Message {
  action: string;
  data?: any;
  target?: string;
  srcUrl?: string;
}

// Response interface
export interface Response {
  success: boolean;
  data?: any;
  error?: string;
}

// Messaging helpers
export const MessageHelper = {
  // Send a message to the background script
  async sendToBackground(message: Message): Promise<Response> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response: Response) => {
        resolve(response);
      });
    });
  },

  // Send a message to the content script in the active tab
  async sendToContentScript(message: Message): Promise<Response> {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, message, (response: Response) => {
            resolve(response);
          });
        } else {
          resolve({ success: false, error: 'No active tab found' });
        }
      });
    });
  }
};

// Helper to handle JSON responses
export function handleApiResponse(response: string): any {
  try {
    return JSON.parse(response);
  } catch (e) {
    return response;
  }
}

// Format fact-checking results
export function formatFactCheckResults(results: any): string {
  if (typeof results === 'string') {
    return results;
  }

  try {
    let formattedResults = '';
    
    if (results.factCheck) {
      formattedResults += `<h3>Fact Check</h3>`;
      formattedResults += `<p><strong>Accuracy:</strong> ${results.factCheck.accuracy || 'Unknown'}</p>`;
      formattedResults += `<p><strong>Reliability:</strong> ${results.factCheck.reliability || 'Unknown'}</p>`;
      formattedResults += `<p><strong>Assessment:</strong> ${results.factCheck.assessment || 'No assessment available'}</p>`;
    }
    
    if (results.sentimentAnalysis) {
      formattedResults += `<h3>Sentiment Analysis</h3>`;
      formattedResults += `<p><strong>Sentiment:</strong> ${results.sentimentAnalysis.sentiment || 'Unknown'}</p>`;
      formattedResults += `<p><strong>Confidence:</strong> ${results.sentimentAnalysis.confidence || 'Unknown'}</p>`;
    }
    
    if (formattedResults === '') {
      return JSON.stringify(results, null, 2);
    }
    
    return formattedResults;
  } catch (e) {
    return JSON.stringify(results, null, 2);
  }
}
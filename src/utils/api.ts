// API utility functions for FactifyAI

interface TextAnalysisOptions {
  factCheck: boolean;
  biasDetection: boolean;
  relatedArticles: boolean;
  similarDiscussions: boolean;
  trustedAlternatives: boolean;
  explainSummarize: boolean;
}

interface ImageAnalysisOptions {
  factCheck: boolean;
  imageSourceLookup: boolean;
  trustedAlternatives: boolean;
  explainSummarize: boolean;
}

interface TextAnalysisRequest {
  text: string;
  enabledOptions: TextAnalysisOptions;
  apiKey: string;
}

interface ImageAnalysisRequest {
  image: string; // base64 encoded image
  enabledOptions: ImageAnalysisOptions;
  apiKey: string;
}

// Example response structure
interface AnalysisResponse {
  success: boolean;
  data: {
    result: string;
    sources?: string[];
    confidence?: number;
    alternatives?: string[];
    bias?: string;
    // Other fields based on enabled options
  };
  error?: string;
}

// Get API key from Chrome storage
export const getApiKey = async (): Promise<string> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['apiKey'], (result) => {
      resolve(result.apiKey || '');
    });
  });
};

// Save API key to Chrome storage
export const saveApiKey = async (apiKey: string): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ apiKey }, () => {
      resolve();
    });
  });
};

// Get usage count from Chrome storage
export const getUsageCount = async (): Promise<number> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['usageCount'], (result) => {
      resolve(result.usageCount || 0);
    });
  });
};

// Increment usage count
export const incrementUsageCount = async (): Promise<void> => {
  const currentCount = await getUsageCount();
  return new Promise((resolve) => {
    chrome.storage.local.set({ usageCount: currentCount + 1 }, () => {
      resolve();
    });
  });
};

// Reset storage (API key and usage count)
export const resetStorage = async (): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.clear(() => {
      resolve();
    });
  });
};

// Analyze text API call
export const analyzeText = async (
  text: string,
  options: TextAnalysisOptions
): Promise<AnalysisResponse> => {
  try {
    const apiKey = await getApiKey();
    
    // Check if API key exists
    if (!apiKey) {
      return {
        success: false,
        data: { result: '' },
        error: 'API key not found. Please enter your API key in the extension settings.'
      };
    }
    
    // Increment usage count
    await incrementUsageCount();
    
    // Create request payload
    const payload: TextAnalysisRequest = {
      text,
      enabledOptions: options,
      apiKey
    };

    // For now, this is a dummy API endpoint
    // Replace with your actual API endpoint
    const response = await fetch('https://api.factifyai.com/analyze/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // If you're building a proof of concept without a real backend yet,
    // you can mock the response like this:
    if (!response.ok) {
      // Mock response for development
      return {
        success: true,
        data: {
          result: 'This is a simulated response for text analysis.',
          confidence: 0.85,
          sources: ['https://example.com/source1', 'https://example.com/source2'],
          alternatives: options.trustedAlternatives ? ['Trusted alternative 1', 'Trusted alternative 2'] : undefined,
          bias: options.biasDetection ? 'No significant bias detected' : undefined,
        }
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error analyzing text:', error);
    return {
      success: false,
      data: { result: '' },
      error: 'Failed to analyze text. Please try again later.'
    };
  }
};

// Analyze image API call
export const analyzeImage = async (
  imageData: string,
  options: ImageAnalysisOptions
): Promise<AnalysisResponse> => {
  try {
    const apiKey = await getApiKey();
    
    // Check if API key exists
    if (!apiKey) {
      return {
        success: false,
        data: { result: '' },
        error: 'API key not found. Please enter your API key in the extension settings.'
      };
    }
    
    // Increment usage count
    await incrementUsageCount();
    
    // Create request payload
    const payload: ImageAnalysisRequest = {
      image: imageData,
      enabledOptions: options,
      apiKey
    };

    // For now, this is a dummy API endpoint
    // Replace with your actual API endpoint
    const response = await fetch('https://api.factifyai.com/analyze/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // If you're building a proof of concept without a real backend yet,
    // you can mock the response like this:
    if (!response.ok) {
      // Mock response for development
      return {
        success: true,
        data: {
          result: 'This is a simulated response for image analysis.',
          confidence: 0.75,
          sources: options.imageSourceLookup ? ['https://example.com/source1', 'https://example.com/source2'] : undefined,
          alternatives: options.trustedAlternatives ? ['Trusted alternative image 1', 'Trusted alternative image 2'] : undefined,
        }
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error analyzing image:', error);
    return {
      success: false,
      data: { result: '' },
      error: 'Failed to analyze image. Please try again later.'
    };
  }
};
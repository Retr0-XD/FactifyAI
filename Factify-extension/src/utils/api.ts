// API service for FactifyAI
import { TextAnalysisRequest, ImageAnalysisRequest, AnalysisResult } from './types';

// Dummy API endpoints
const API_BASE_URL = 'https://factifyai-api-dummy.com';
// These endpoints are defined but not used directly in dummy implementation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TEXT_ENDPOINT = `${API_BASE_URL}/analyze/text`;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const IMAGE_ENDPOINT = `${API_BASE_URL}/analyze/image`;

// Helper function to simulate API response delay for our dummy API
const simulateApiDelay = (): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, 1500));
};

// Analyze text content
export const analyzeText = async (request: TextAnalysisRequest): Promise<AnalysisResult> => {
  try {
    // In a real implementation, this would be an actual API call
    // For our demo, we'll simulate a successful API response
    await simulateApiDelay();
    
    // Generate dummy response based on enabled options
    const response: AnalysisResult = {
      success: true,
      data: {}
    };
    
    if (request.enabledOptions.factCheck) {
      response.data!.factCheck = {
        rating: 'Mostly True',
        explanation: 'The selected content appears to be factually accurate with minor details that could be improved.'
      };
    }
    
    if (request.enabledOptions.biasDetection) {
      response.data!.biasDetection = {
        bias: 'Slight bias detected',
        explanation: 'The content shows minor signs of perspective bias but generally presents facts fairly.'
      };
    }
    
    if (request.enabledOptions.relatedArticles) {
      response.data!.relatedArticles = [
        {
          title: 'Related Article 1',
          url: 'https://example.com/article1',
          summary: 'This article provides additional context on the topic.'
        },
        {
          title: 'Related Article 2',
          url: 'https://example.com/article2',
          summary: 'This article offers a different perspective on the same topic.'
        }
      ];
    }
    
    if (request.enabledOptions.similarDiscussions) {
      response.data!.similarDiscussions = [
        {
          title: 'Discussion on Reddit',
          url: 'https://reddit.com/r/topic',
          summary: 'Users discussing the merits of these claims.'
        },
        {
          title: 'Twitter Thread',
          url: 'https://twitter.com/user/status/123',
          summary: 'Expert analysis of similar claims.'
        }
      ];
    }
    
    if (request.enabledOptions.trustedAlternatives) {
      response.data!.trustedAlternatives = [
        {
          title: 'Trusted Source 1',
          url: 'https://trusted-source.com/article',
          summary: 'A well-vetted article on this topic from a trusted source.'
        },
        {
          title: 'Trusted Source 2',
          url: 'https://research-institute.org/paper',
          summary: 'Academic research on this subject from a trusted institution.'
        }
      ];
    }
    
    if (request.enabledOptions.explainSummarize) {
      response.data!.explainSummarize = {
        summary: 'The content discusses key facts about the topic in a clear manner.',
        keyPoints: [
          'Point 1: The main claim is supported by evidence.',
          'Point 2: Some context may be missing from the original statement.',
          'Point 3: Overall, the information is accurate but could be more complete.'
        ]
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error analyzing text:', error);
    return {
      success: false,
      error: 'Failed to analyze text. Please try again later.'
    };
  }
};

// Analyze image content
export const analyzeImage = async (request: ImageAnalysisRequest): Promise<AnalysisResult> => {
  try {
    // In a real implementation, this would be an actual API call
    // For our demo, we'll simulate a successful API response
    await simulateApiDelay();
    
    // Generate dummy response based on enabled options
    const response: AnalysisResult = {
      success: true,
      data: {}
    };
    
    if (request.enabledOptions.factCheck) {
      response.data!.factCheck = {
        rating: 'Unverified',
        explanation: 'This image requires more context to verify its authenticity. Some elements may be modified or presented out of context.'
      };
    }
    
    if (request.enabledOptions.imageSourceLookup) {
      response.data!.imageSourceLookup = {
        sources: [
          {
            url: 'https://original-source.com/image',
            confidence: 0.92
          },
          {
            url: 'https://another-source.org/article/image',
            confidence: 0.78
          }
        ]
      };
    }
    
    if (request.enabledOptions.trustedAlternatives) {
      response.data!.trustedAlternatives = [
        {
          title: 'Trusted Image Repository',
          url: 'https://verified-images.org/topic',
          summary: 'A collection of verified images on this topic.'
        },
        {
          title: 'Official Source',
          url: 'https://official-source.gov/gallery',
          summary: 'Official image repository with verified context.'
        }
      ];
    }
    
    if (request.enabledOptions.explainSummarize) {
      response.data!.explainSummarize = {
        summary: 'The image appears to show a scene related to the topic, with some visual elements that need verification.',
        keyPoints: [
          'The image depicts the main subject in context.',
          'Some visual elements appear to be authentic, while others may be modified.',
          'Additional context is needed to fully interpret this image.'
        ]
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error analyzing image:', error);
    return {
      success: false,
      error: 'Failed to analyze image. Please try again later.'
    };
  }
};

// Get the API key from storage
export const getApiKey = async (): Promise<string> => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'GET_API_KEY' }, (response) => {
      resolve(response?.apiKey || '');
    });
  });
};

// Save the API key to storage
export const saveApiKey = async (apiKey: string): Promise<boolean> => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'SET_API_KEY', apiKey }, (response) => {
      resolve(response?.success || false);
    });
  });
};
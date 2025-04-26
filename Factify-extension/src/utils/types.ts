// Types and interfaces for FactifyAI

// Analysis options for text
export interface TextOptions {
  factCheck: boolean;
  biasDetection: boolean;
  relatedArticles: boolean;
  similarDiscussions: boolean;
  trustedAlternatives: boolean;
  explainSummarize: boolean;
}

// Analysis options for images
export interface ImageOptions {
  factCheck: boolean;
  imageSourceLookup: boolean;
  trustedAlternatives: boolean;
  explainSummarize: boolean;
}

// Request payload for text analysis
export interface TextAnalysisRequest {
  text: string;
  enabledOptions: TextOptions;
  apiKey: string;
}

// Request payload for image analysis
export interface ImageAnalysisRequest {
  image: string; // Base64 encoded image
  enabledOptions: ImageOptions;
  apiKey: string;
}

// Analysis result structure
export interface AnalysisResult {
  success: boolean;
  data?: {
    factCheck?: {
      rating: string;
      explanation: string;
    };
    biasDetection?: {
      bias: string;
      explanation: string;
    };
    relatedArticles?: Array<{
      title: string;
      url: string;
      summary: string;
    }>;
    similarDiscussions?: Array<{
      title: string;
      url: string;
      summary: string;
    }>;
    trustedAlternatives?: Array<{
      title: string;
      url: string;
      summary: string;
    }>;
    explainSummarize?: {
      summary: string;
      keyPoints: string[];
    };
    imageSourceLookup?: {
      sources: Array<{
        url: string;
        confidence: number;
      }>;
    };
  };
  error?: string;
}
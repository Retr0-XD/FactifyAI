import React, { useState, useEffect } from 'react';
import { TextOptions, ImageOptions, AnalysisResult } from '../utils/types';
import { analyzeText, analyzeImage, getApiKey } from '../utils/api';

interface AnalysisModalProps {
  contentType: string;
  selectedContent: string;
  initialOptions: TextOptions | ImageOptions;
  onClose: () => void;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({
  contentType,
  selectedContent,
  initialOptions,
  onClose
}) => {
  const [options, setOptions] = useState<TextOptions | ImageOptions>(initialOptions);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [apiKeyError, setApiKeyError] = useState<boolean>(false);
  
  // Create modal container when component mounts
  useEffect(() => {
    // Get API key from storage
    const fetchApiKey = async () => {
      const key = await getApiKey();
      setApiKey(key);
      if (!key) {
        setApiKeyError(true);
      }
    };
    
    fetchApiKey();
    
    // Prevent scrolling of background content
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  
  // Handle option changes
  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setOptions({
      ...options,
      [name]: checked
    });
  };
  
  // Handle analysis submission
  const handleAnalyze = async () => {
    if (!apiKey) {
      setApiKeyError(true);
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // Increment usage count
      chrome.storage.local.get(['usageCount'], (result) => {
        const count = (result.usageCount || 0) + 1;
        chrome.storage.local.set({ usageCount: count });
      });
      
      if (contentType === 'text') {
        const response = await analyzeText({
          text: selectedContent,
          enabledOptions: options as TextOptions,
          apiKey
        });
        setResult(response);
      } else if (contentType === 'image') {
        const response = await analyzeImage({
          image: selectedContent, // In a real implementation, this would be base64
          enabledOptions: options as ImageOptions,
          apiKey
        });
        setResult(response);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setResult({
        success: false,
        error: 'An error occurred during analysis. Please try again.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Determine if any options are selected
  const hasOptionsSelected = Object.values(options).some(value => value === true);
  
  // Render analysis results
  const renderResults = () => {
    if (!result) return null;
    
    if (!result.success) {
      return (
        <div className="p-4 mb-4 bg-red-100 border border-red-300 rounded-md">
          <p className="text-red-700">{result.error || 'An error occurred during analysis.'}</p>
        </div>
      );
    }
    
    if (!result.data) {
      return (
        <div className="p-4 mb-4 bg-yellow-100 border border-yellow-300 rounded-md">
          <p className="text-yellow-700">No analysis data available.</p>
        </div>
      );
    }
    
    return (
      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Analysis Results</h3>
        
        {result.data.factCheck && (
          <div className="p-4 bg-blue-50 rounded-md">
            <h4 className="font-medium text-blue-800">Fact Check</h4>
            <p className="mt-1 text-blue-700">Rating: {result.data.factCheck.rating}</p>
            <p className="mt-1 text-sm text-blue-600">{result.data.factCheck.explanation}</p>
          </div>
        )}
        
        {result.data.biasDetection && (
          <div className="p-4 bg-purple-50 rounded-md">
            <h4 className="font-medium text-purple-800">Bias Detection</h4>
            <p className="mt-1 text-purple-700">{result.data.biasDetection.bias}</p>
            <p className="mt-1 text-sm text-purple-600">{result.data.biasDetection.explanation}</p>
          </div>
        )}
        
        {result.data.imageSourceLookup && (
          <div className="p-4 bg-green-50 rounded-md">
            <h4 className="font-medium text-green-800">Image Source Analysis</h4>
            <div className="mt-2 space-y-2">
              {result.data.imageSourceLookup.sources.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {source.url.substring(0, 50)}...
                  </a>
                  <span className="text-sm text-gray-600">
                    {(source.confidence * 100).toFixed(0)}% match
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {result.data.explainSummarize && (
          <div className="p-4 bg-yellow-50 rounded-md">
            <h4 className="font-medium text-yellow-800">Summary</h4>
            <p className="mt-1 text-yellow-700">{result.data.explainSummarize.summary}</p>
            <ul className="mt-2 ml-5 space-y-1 list-disc">
              {result.data.explainSummarize.keyPoints.map((point, index) => (
                <li key={index} className="text-sm text-yellow-700">{point}</li>
              ))}
            </ul>
          </div>
        )}
        
        {result.data.relatedArticles && result.data.relatedArticles.length > 0 && (
          <div className="p-4 bg-indigo-50 rounded-md">
            <h4 className="font-medium text-indigo-800">Related Articles</h4>
            <div className="mt-2 space-y-3">
              {result.data.relatedArticles.map((article, index) => (
                <div key={index} className="border-b border-indigo-100 pb-2">
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {article.title}
                  </a>
                  <p className="mt-1 text-sm text-indigo-600">{article.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {result.data.similarDiscussions && result.data.similarDiscussions.length > 0 && (
          <div className="p-4 bg-pink-50 rounded-md">
            <h4 className="font-medium text-pink-800">Similar Discussions</h4>
            <div className="mt-2 space-y-3">
              {result.data.similarDiscussions.map((discussion, index) => (
                <div key={index} className="border-b border-pink-100 pb-2">
                  <a 
                    href={discussion.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {discussion.title}
                  </a>
                  <p className="mt-1 text-sm text-pink-600">{discussion.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {result.data.trustedAlternatives && result.data.trustedAlternatives.length > 0 && (
          <div className="p-4 bg-teal-50 rounded-md">
            <h4 className="font-medium text-teal-800">Trusted Alternatives</h4>
            <div className="mt-2 space-y-3">
              {result.data.trustedAlternatives.map((source, index) => (
                <div key={index} className="border-b border-teal-100 pb-2">
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {source.title}
                  </a>
                  <p className="mt-1 text-sm text-teal-600">{source.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render text content preview
  const renderContentPreview = () => {
    if (contentType === 'text') {
      return (
        <div className="p-3 bg-gray-50 rounded-md border border-gray-200 mb-4">
          <p className="text-gray-600 text-sm italic">
            {selectedContent.length > 150 
              ? `${selectedContent.substring(0, 150)}...` 
              : selectedContent}
          </p>
        </div>
      );
    } else if (contentType === 'image') {
      return (
        <div className="flex justify-center mb-4">
          <img 
            src={selectedContent} 
            alt="Selected content" 
            className="max-h-32 object-contain rounded-md border border-gray-200" 
          />
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="fixed inset-0 z-[10000] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all max-w-lg w-full">
          {/* Header */}
          <div className="bg-blue-600 px-4 py-3 flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">
              FactifyAI Analysis
            </h3>
            <button
              type="button"
              className="text-white hover:text-gray-200"
              onClick={onClose}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {apiKeyError && !apiKey && (
              <div className="p-3 mb-4 bg-red-100 border border-red-300 rounded-md">
                <p className="text-sm text-red-700">
                  API key is missing. Please add your API key in the extension popup.
                </p>
              </div>
            )}
            
            {renderContentPreview()}
            
            {!result ? (
              <>
                <div className="mb-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">
                    Choose analysis options:
                  </h4>
                  
                  <div className="space-y-2">
                    {contentType === 'text' ? (
                      // Text analysis options
                      <>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="factCheck"
                            name="factCheck"
                            checked={(options as TextOptions).factCheck}
                            onChange={handleOptionChange}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor="factCheck" className="ml-2 text-sm text-gray-700">
                            Fact Check
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="biasDetection"
                            name="biasDetection"
                            checked={(options as TextOptions).biasDetection}
                            onChange={handleOptionChange}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor="biasDetection" className="ml-2 text-sm text-gray-700">
                            Bias Detection
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="relatedArticles"
                            name="relatedArticles"
                            checked={(options as TextOptions).relatedArticles}
                            onChange={handleOptionChange}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor="relatedArticles" className="ml-2 text-sm text-gray-700">
                            Related Articles
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="similarDiscussions"
                            name="similarDiscussions"
                            checked={(options as TextOptions).similarDiscussions}
                            onChange={handleOptionChange}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor="similarDiscussions" className="ml-2 text-sm text-gray-700">
                            Similar Discussions
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="trustedAlternatives"
                            name="trustedAlternatives"
                            checked={(options as TextOptions).trustedAlternatives}
                            onChange={handleOptionChange}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor="trustedAlternatives" className="ml-2 text-sm text-gray-700">
                            Trusted Alternatives
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="explainSummarize"
                            name="explainSummarize"
                            checked={(options as TextOptions).explainSummarize}
                            onChange={handleOptionChange}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor="explainSummarize" className="ml-2 text-sm text-gray-700">
                            Explain & Summarize
                          </label>
                        </div>
                      </>
                    ) : (
                      // Image analysis options
                      <>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="factCheck"
                            name="factCheck"
                            checked={(options as ImageOptions).factCheck}
                            onChange={handleOptionChange}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor="factCheck" className="ml-2 text-sm text-gray-700">
                            Fact Check
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="imageSourceLookup"
                            name="imageSourceLookup"
                            checked={(options as ImageOptions).imageSourceLookup}
                            onChange={handleOptionChange}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor="imageSourceLookup" className="ml-2 text-sm text-gray-700">
                            Image Source Lookup
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="trustedAlternatives"
                            name="trustedAlternatives"
                            checked={(options as ImageOptions).trustedAlternatives}
                            onChange={handleOptionChange}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor="trustedAlternatives" className="ml-2 text-sm text-gray-700">
                            Trusted Alternatives
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="explainSummarize"
                            name="explainSummarize"
                            checked={(options as ImageOptions).explainSummarize}
                            onChange={handleOptionChange}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor="explainSummarize" className="ml-2 text-sm text-gray-700">
                            Explain & Summarize
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="button"
                    className={`w-full flex justify-center items-center px-4 py-2 rounded-md text-white ${
                      !hasOptionsSelected || isAnalyzing || !apiKey
                        ? 'bg-blue-300 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    onClick={handleAnalyze}
                    disabled={!hasOptionsSelected || isAnalyzing || !apiKey}
                  >
                    {isAnalyzing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                      </>
                    ) : (
                      'Analyze'
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                {renderResults()}
                
                <div className="mt-6">
                  <button
                    type="button"
                    className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    onClick={() => setResult(null)}
                  >
                    Back to Options
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;
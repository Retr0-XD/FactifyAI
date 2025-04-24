import React, { useState, useEffect } from 'react';
import { analyzeText, analyzeImage } from '../utils/api';

interface AnalyzeModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'text' | 'image';
  content: string;
  position: { top: number; left: number };
}

const AnalyzeModal: React.FC<AnalyzeModalProps> = ({
  isOpen,
  onClose,
  type,
  content,
  position,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Text analysis options
  const [factCheck, setFactCheck] = useState(true);
  const [biasDetection, setBiasDetection] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState(false);
  const [similarDiscussions, setSimilarDiscussions] = useState(false);
  const [trustedAlternatives, setTrustedAlternatives] = useState(true);
  const [explainSummarize, setExplainSummarize] = useState(false);
  
  // Image analysis options
  const [imageSourceLookup, setImageSourceLookup] = useState(true);
  
  useEffect(() => {
    // Reset state when modal opens or closes
    if (!isOpen) {
      setResult(null);
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);
  
  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      if (type === 'text') {
        const options = {
          factCheck,
          biasDetection,
          relatedArticles,
          similarDiscussions,
          trustedAlternatives,
          explainSummarize,
        };
        
        const response = await analyzeText(content, options);
        
        if (!response.success) {
          setError(response.error || 'Failed to analyze text. Please try again.');
        } else {
          setResult(response.data);
        }
      } else if (type === 'image') {
        const options = {
          factCheck,
          imageSourceLookup,
          trustedAlternatives,
          explainSummarize,
        };
        
        const response = await analyzeImage(content, options);
        
        if (!response.success) {
          setError(response.error || 'Failed to analyze image. Please try again.');
        } else {
          setResult(response.data);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate modal position - keep it within viewport
  const modalStyle = {
    top: `${Math.min(Math.max(position.top, 20), window.innerHeight - 300)}px`,
    left: `${Math.min(Math.max(position.left, 20), window.innerWidth - 300)}px`,
  };
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="fixed z-[9999] w-[350px] max-w-[90vw] bg-white rounded-lg shadow-xl overflow-hidden"
        style={modalStyle}
      >
        {/* Modal Header */}
        <div className="bg-blue-600 px-4 py-3 text-white flex justify-between items-center">
          <h3 className="font-medium text-lg">
            {type === 'text' ? 'Analyze Text' : 'Analyze Image'}
          </h3>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="p-4">
          <div className="mb-4">
            <h4 className="font-medium text-gray-800 mb-2">Options</h4>
            
            {/* Option checkboxes */}
            <div className="space-y-2">
              {type === 'text' ? (
                <>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={factCheck} 
                      onChange={(e) => setFactCheck(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <span>Fact Check</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={biasDetection} 
                      onChange={(e) => setBiasDetection(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <span>Bias Detection</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={relatedArticles} 
                      onChange={(e) => setRelatedArticles(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <span>Find Related Articles</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={similarDiscussions} 
                      onChange={(e) => setSimilarDiscussions(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <span>Find Similar Discussions</span>
                  </label>
                </>
              ) : (
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={imageSourceLookup} 
                    onChange={(e) => setImageSourceLookup(e.target.checked)}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span>Image Source Lookup</span>
                </label>
              )}
              
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={trustedAlternatives} 
                  onChange={(e) => setTrustedAlternatives(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span>Find Trusted Alternatives</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={explainSummarize} 
                  onChange={(e) => setExplainSummarize(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span>Explain/Summarize</span>
              </label>
            </div>
          </div>
          
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className={`w-full py-2 px-4 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white rounded-md transition-colors`}
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
        
        {/* Results Section */}
        {(loading || result || error) && (
          <div className="border-t border-gray-200 p-4">
            <h4 className="font-medium text-gray-800 mb-2">Results</h4>
            
            {loading && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md">
                {error}
              </div>
            )}
            
            {result && !loading && (
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-gray-800">{result.result}</p>
                </div>
                
                {result.confidence !== undefined && (
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Confidence:</span>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${result.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {Math.round(result.confidence * 100)}%
                    </span>
                  </div>
                )}
                
                {result.sources && result.sources.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Sources:</h5>
                    <ul className="text-sm text-blue-600 space-y-1">
                      {result.sources.map((source: string, index: number) => (
                        <li key={index}>
                          <a 
                            href={source} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {source}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {result.alternatives && result.alternatives.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">
                      Trusted Alternatives:
                    </h5>
                    <ul className="text-sm text-gray-800 space-y-1">
                      {result.alternatives.map((alt: string, index: number) => (
                        <li key={index} className="bg-green-50 p-2 rounded">
                          {alt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {result.bias && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">
                      Bias Analysis:
                    </h5>
                    <p className="text-sm text-gray-800 bg-yellow-50 p-2 rounded">
                      {result.bias}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default AnalyzeModal;
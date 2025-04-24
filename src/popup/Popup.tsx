import React, { useState, useEffect } from 'react';
import { getApiKey, saveApiKey, getUsageCount, resetStorage } from '../utils/api';

// Main Popup Component
const Popup: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [usageCount, setUsageCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'api' | 'usage' | 'instructions'>('api');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      const storedApiKey = await getApiKey();
      setApiKey(storedApiKey);
      
      const count = await getUsageCount();
      setUsageCount(count);
    };
    
    loadData();
  }, []);
  
  // Handle API key save
  const handleSaveApiKey = async () => {
    setSaveStatus('saving');
    try {
      await saveApiKey(apiKey);
      setSaveStatus('saved');
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Error saving API key:', error);
      setSaveStatus('error');
    }
  };
  
  // Handle reset all data
  const handleReset = async () => {
    const confirmed = window.confirm('Are you sure you want to reset all data? This will clear your API key and usage count.');
    
    if (confirmed) {
      try {
        await resetStorage();
        setApiKey('');
        setUsageCount(0);
        setSaveStatus('saved');
        
        // Reset status after 2 seconds
        setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      } catch (error) {
        console.error('Error resetting data:', error);
        setSaveStatus('error');
      }
    }
  };
  
  return (
    <div className="w-80 p-4 bg-white text-gray-800">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-blue-600 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2">
            <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
          </svg>
          FactifyAI
        </h1>
        <p className="text-sm text-gray-600">
          Analyze content and detect misinformation
        </p>
      </header>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'api'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('api')}
        >
          API Key
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'usage'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('usage')}
        >
          Usage
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'instructions'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('instructions')}
        >
          Help
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="mt-4">
        {/* API Key Tab */}
        {activeTab === 'api' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your HuggingFace API key"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="mt-1 text-xs text-gray-500">
              Get your API key from HuggingFace.
            </div>
            
            <button
              onClick={handleSaveApiKey}
              disabled={saveStatus === 'saving'}
              className={`mt-3 w-full py-2 px-4 ${
                saveStatus === 'saving'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white rounded-md transition-colors`}
            >
              {saveStatus === 'saving'
                ? 'Saving...'
                : saveStatus === 'saved'
                ? 'Saved!'
                : 'Save API Key'}
            </button>
            
            {saveStatus === 'error' && (
              <div className="mt-2 text-sm text-red-600">
                Error saving API key. Please try again.
              </div>
            )}
          </div>
        )}
        
        {/* Usage Tab */}
        {activeTab === 'usage' && (
          <div>
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Usage Statistics
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Analyses:</span>
                <span className="text-blue-600 font-medium">{usageCount}</span>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Reset Data
              </h3>
              <button
                onClick={handleReset}
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Reset All Data
              </button>
              <div className="mt-1 text-xs text-gray-500">
                This will clear your API key and usage statistics.
              </div>
            </div>
          </div>
        )}
        
        {/* Instructions Tab */}
        {activeTab === 'instructions' && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-800">
              How to Use FactifyAI
            </h3>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700">For Text:</h4>
              <ol className="list-decimal list-inside text-sm text-gray-600 ml-2 space-y-1">
                <li>Select any text on a webpage</li>
                <li>Click the FactifyAI button that appears</li>
                <li>Choose analysis options in the modal</li>
                <li>Click "Analyze" to see results</li>
              </ol>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700">For Images:</h4>
              <ol className="list-decimal list-inside text-sm text-gray-600 ml-2 space-y-1">
                <li>Hover over any image on a webpage</li>
                <li>Click the FactifyAI button that appears</li>
                <li>Or right-click on an image and select "Analyze with FactifyAI"</li>
                <li>Choose analysis options in the modal</li>
                <li>Click "Analyze" to see results</li>
              </ol>
            </div>
            
            <div className="pt-2 text-sm text-gray-500">
              <p>
                Make sure to add your API key in the "API Key" tab to use all features.
              </p>
            </div>
          </div>
        )}
      </div>
      
      <footer className="mt-6 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
        FactifyAI v1.0 - Detect misinformation and analyze content
      </footer>
    </div>
  );
};

export default Popup;
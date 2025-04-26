import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { getApiKey, saveApiKey } from '../utils/api';
import '../index.css';

const Popup: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [usageCount, setUsageCount] = useState<number>(0);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchApiKey = async () => {
      const key = await getApiKey();
      setApiKey(key);
      setIsLoading(false);
    };

    const fetchUsageCount = async () => {
      // In a real implementation, this would fetch the actual usage count
      // For now, we'll just use a random number for demo purposes
      chrome.storage.local.get(['usageCount'], (result) => {
        setUsageCount(result.usageCount || 0);
      });
    };

    fetchApiKey();
    fetchUsageCount();
  }, []);

  const handleSaveApiKey = async () => {
    setIsLoading(true);
    const success = await saveApiKey(apiKey);
    setIsLoading(false);
    
    if (success) {
      setSaveStatus('API key saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } else {
      setSaveStatus('Failed to save API key. Please try again.');
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    const success = await saveApiKey('');
    await chrome.storage.local.set({ usageCount: 0 });
    
    setApiKey('');
    setUsageCount(0);
    setIsLoading(false);
    
    if (success) {
      setSaveStatus('Settings reset successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } else {
      setSaveStatus('Failed to reset settings. Please try again.');
    }
  };

  return (
    <div className="w-80 p-4 bg-gray-50">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-blue-600">FactifyAI</h1>
        <p className="text-sm text-gray-600">AI-powered fact checking for text and images</p>
      </header>

      <div className="mb-4">
        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
          API Key
        </label>
        <input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your API key"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-between mb-4">
        <button
          onClick={handleSaveApiKey}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Save
        </button>
        <button
          onClick={handleReset}
          disabled={isLoading}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        >
          Reset
        </button>
      </div>

      {saveStatus && (
        <div className="mb-4 p-2 bg-green-100 text-green-800 rounded-md text-sm">
          {saveStatus}
        </div>
      )}

      <div className="mb-4 p-3 bg-gray-100 rounded-md">
        <p className="text-sm font-medium text-gray-700">Usage Statistics</p>
        <p className="text-sm text-gray-600">Analyses performed: {usageCount}</p>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h2 className="text-md font-semibold text-gray-700 mb-2">How to use FactifyAI</h2>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>Select text or right-click on an image on any webpage</li>
          <li>Click on the FactifyAI bubble that appears</li>
          <li>Choose the analysis options you want</li>
          <li>Click "Analyze" to get AI-powered insights</li>
        </ol>
      </div>
    </div>
  );
};

// Create root element and render popup
const container = document.getElementById('popup-root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
}

export default Popup;
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import '../global.css';
import './popup.css';

interface EnableOptions {
  factCheck: boolean;
  sentimentAnalysis: boolean;
  [key: string]: boolean;
}

// Enable verbose logging for debugging
const DEBUG = true;

// Logger helper
function log(...args: any[]): void {
  if (DEBUG) {
    console.log('[FactifyAI Popup]', ...args);
  }
}

const Popup: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [model, setModel] = useState<string>('default-model');
  const [status, setStatus] = useState<string>('');
  const [backendStatus, setBackendStatus] = useState<boolean | null>(null);
  const [enableOptions, setEnableOptions] = useState<EnableOptions>({
    factCheck: true, 
    sentimentAnalysis: false
  });
  const [isChecking, setIsChecking] = useState<boolean>(false);

  // Load saved settings on component mount
  useEffect(() => {
    log('Popup initialized, loading saved settings');
    chrome.storage.sync.get(['apiKey', 'model', 'enableOptions'], (result: {
      apiKey?: string;
      model?: string;
      enableOptions?: EnableOptions;
    }) => {
      log('Loaded settings from storage:', { 
        hasApiKey: !!result.apiKey, 
        model: result.model,
        enableOptions: result.enableOptions
      });
      
      if (result.apiKey) setApiKey(result.apiKey);
      if (result.model) setModel(result.model);
      if (result.enableOptions) setEnableOptions(result.enableOptions);
    });

    // Check backend health
    checkBackendHealth();
  }, []);

  // Check backend health status
  const checkBackendHealth = (): void => {
    setIsChecking(true);
    log('Checking backend health');
    
    chrome.runtime.sendMessage(
      { action: 'checkHealth' },
      (response: { success: boolean; data?: boolean; error?: string }) => {
        setIsChecking(false);
        
        if (chrome.runtime.lastError) {
          log('Runtime error checking health:', chrome.runtime.lastError);
          setBackendStatus(false);
          setStatus(`Error: ${chrome.runtime.lastError.message}`);
          setTimeout(() => setStatus(''), 3000);
          return;
        }
        
        log('Health check response:', response);
        
        if (response && response.success) {
          setBackendStatus(response.data || false);
        } else {
          setBackendStatus(false);
          if (response?.error) {
            setStatus(`Error: ${response.error}`);
            setTimeout(() => setStatus(''), 3000);
          }
        }
      }
    );
  };

  // Save API key to Chrome storage
  const saveApiKey = (): void => {
    if (!apiKey) {
      setStatus('Please enter an API key');
      return;
    }

    log('Saving API key');
    chrome.storage.sync.set({ apiKey }, () => {
      if (chrome.runtime.lastError) {
        log('Error saving API key:', chrome.runtime.lastError);
        setStatus(`Error: ${chrome.runtime.lastError.message}`);
      } else {
        setStatus('API key saved');
        log('API key saved successfully');
      }
      
      // Clear status message after 3 seconds
      setTimeout(() => setStatus(''), 3000);
    });
  };

  // Save model to Chrome storage
  const saveModel = (): void => {
    log('Saving model:', model);
    chrome.storage.sync.set({ model }, () => {
      if (chrome.runtime.lastError) {
        log('Error saving model:', chrome.runtime.lastError);
        setStatus(`Error: ${chrome.runtime.lastError.message}`);
      } else {
        setStatus('Model saved');
        log('Model saved successfully');
      }
      
      // Clear status message after 3 seconds
      setTimeout(() => setStatus(''), 3000);
    });
  };

  // Save options to Chrome storage
  const saveOptions = (): void => {
    log('Saving options:', enableOptions);
    chrome.storage.sync.set({ enableOptions }, () => {
      if (chrome.runtime.lastError) {
        log('Error saving options:', chrome.runtime.lastError);
        setStatus(`Error: ${chrome.runtime.lastError.message}`);
      } else {
        setStatus('Options saved');
        log('Options saved successfully');
      }
      
      // Clear status message after 3 seconds
      setTimeout(() => setStatus(''), 3000);
    });
  };

  // Handle option checkbox changes
  const handleOptionChange = (option: string): void => {
    log('Option changed:', option);
    setEnableOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1>FactifyAI</h1>
        <p className="subtitle">AI-powered fact checking tool</p>
      </header>

      <div className="status-indicator">
        <span>Backend Status:</span>
        <span className={`status-dot ${isChecking ? 'checking' : backendStatus === null ? 'checking' : backendStatus ? 'online' : 'offline'}`}></span>
        <span>{isChecking ? 'Checking...' : backendStatus === null ? 'Checking...' : backendStatus ? 'Online' : 'Offline'}</span>
        <button className="refresh-button" onClick={checkBackendHealth} disabled={isChecking}>↻</button>
      </div>

      <div className="settings-section">
        <h2>Settings</h2>
        
        <div className="input-group">
          <label htmlFor="apikey">API Key:</label>
          <input
            type="password"
            id="apikey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Hugging Face API key"
          />
          <button onClick={saveApiKey}>Save</button>
        </div>
        {!apiKey && (
          <div className="api-key-warning">
            ⚠️ You must set an API key for fact-checking to work
          </div>
        )}

        <div className="input-group">
          <label htmlFor="model">Model:</label>
          <select 
            id="model" 
            value={model} 
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="default-model">Default Model</option>
            <option value="gpt2">GPT-2</option>
            <option value="bert-base">BERT Base</option>
            <option value="t5-small">T5 Small</option>
          </select>
          <button onClick={saveModel}>Save</button>
        </div>

        <div className="options-group">
          <h3>Analysis Options:</h3>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={enableOptions.factCheck}
                onChange={() => handleOptionChange('factCheck')}
              />
              Fact Checking
            </label>
          </div>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={enableOptions.sentimentAnalysis}
                onChange={() => handleOptionChange('sentimentAnalysis')}
              />
              Sentiment Analysis
            </label>
          </div>
          <button className="save-options-button" onClick={saveOptions}>Save Options</button>
        </div>
      </div>

      {status && <div className="status-message">{status}</div>}

      <footer className="popup-footer">
        <p>Select text on any webpage and use the Factify button to analyze it.</p>
        <p className="version">Version 1.0.1</p>
      </footer>
    </div>
  );
};

// Render the popup
const root = document.getElementById('root');
if (root) {
  log('Rendering popup component');
  createRoot(root).render(<Popup />);
}
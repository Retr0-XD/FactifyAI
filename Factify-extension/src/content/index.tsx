import '../global.css';
import './content.css';

// Enable verbose logging for debugging
const DEBUG = true;

// Logger helper
function log(...args: any[]): void {
  if (DEBUG) {
    console.log('[FactifyAI Content]', ...args);
  }
}

// Function to create a floating button UI when text is selected
function createFloatingButton(selectedText: string, x: number, y: number): void {
  // Remove any existing floating buttons
  const existingButton = document.getElementById('factify-floating-button');
  if (existingButton) {
    document.body.removeChild(existingButton);
  }

  // Create new floating button
  const floatingButton = document.createElement('div');
  floatingButton.id = 'factify-floating-button';
  floatingButton.innerHTML = 'Factify';
  floatingButton.style.position = 'absolute';
  floatingButton.style.left = `${x}px`;
  floatingButton.style.top = `${y}px`;
  floatingButton.style.zIndex = '9999';
  floatingButton.style.backgroundColor = '#4285f4';
  floatingButton.style.color = 'white';
  floatingButton.style.padding = '8px 12px';
  floatingButton.style.borderRadius = '4px';
  floatingButton.style.cursor = 'pointer';
  floatingButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

  // Add click event to analyze the selected text
  floatingButton.addEventListener('click', () => {
    log('Factify button clicked');
    analyzeText(selectedText);
    document.body.removeChild(floatingButton);
  });

  document.body.appendChild(floatingButton);
  log('Floating button created for text:', selectedText.substring(0, 50) + (selectedText.length > 50 ? '...' : ''));
}

// Function to handle text selection
function handleTextSelection(): void {
  const selection = window.getSelection();
  
  if (selection && !selection.isCollapsed) {
    const selectedText = selection.toString().trim();
    
    if (selectedText.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Position the button near the selection
      const x = rect.left + window.scrollX + (rect.width / 2);
      const y = rect.bottom + window.scrollY + 10;
      
      log('Text selected:', selectedText.substring(0, 50) + (selectedText.length > 50 ? '...' : ''));
      createFloatingButton(selectedText, x, y);
    }
  }
}

// Function to send selected text to the background script for analysis
function analyzeText(text: string): void {
  log('Starting text analysis process');
  
  // Get API key from storage
  chrome.storage.sync.get(['apiKey', 'model', 'enableOptions'], (result: {
    apiKey?: string;
    model?: string;
    enableOptions?: Record<string, boolean>;
  }) => {
    log('Retrieved storage settings:', { 
      hasApiKey: !!result.apiKey, 
      model: result.model || 'default', 
      enableOptions: result.enableOptions 
    });
    
    if (!result.apiKey) {
      showNotification('Please set your API key in the extension settings (click the extension icon in toolbar)');
      return;
    }
    
    const data = {
      text,
      enableOptions: result.enableOptions || { factCheck: true, sentimentAnalysis: false },
      apikey: result.apiKey,
      model: result.model || 'default-model'
    };
    
    // Show loading indicator
    showLoadingIndicator();
    log('Sending message to background script');
    
    // Send to background script with timeout handling
    const messageTimeout = setTimeout(() => {
      hideLoadingIndicator();
      showNotification('Request timed out. Please try again or check your connection.');
      log('Message request timed out');
    }, 30000); // 30 second timeout
    
    try {
      // Send to background script
      chrome.runtime.sendMessage(
        { action: 'analyzeText', data },
        (response: { success: boolean; data?: string; error?: string }) => {
          clearTimeout(messageTimeout);
          hideLoadingIndicator();
          
          if (chrome.runtime.lastError) {
            log('Chrome runtime error:', chrome.runtime.lastError);
            showNotification(`Extension error: ${chrome.runtime.lastError.message}`);
            return;
          }
          
          log('Received response from background:', response);
          
          if (response && response.success) {
            showResultsModal(response.data || '');
          } else {
            showNotification(`Error: ${response?.error || 'Unknown error occurred. Please try again.'}`);
          }
        }
      );
    } catch (error) {
      clearTimeout(messageTimeout);
      hideLoadingIndicator();
      log('Exception during sendMessage:', error);
      showNotification(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
}

// Function to capture and analyze an image
function captureImage(imageElement: HTMLImageElement): void {
  // Get API key from storage
  chrome.storage.sync.get(['apiKey', 'model'], (result: {
    apiKey?: string;
    model?: string;
  }) => {
    if (!result.apiKey) {
      showNotification('Please set your API key in the extension settings');
      return;
    }
    
    // Create a canvas to convert image to blob
    const canvas = document.createElement('canvas');
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      showNotification('Failed to create canvas context');
      return;
    }
    
    ctx.drawImage(imageElement, 0, 0);
    
    // Convert to blob
    canvas.toBlob((blob) => {
      if (!blob) {
        showNotification('Failed to convert image');
        return;
      }
      
      const data = {
        imageData: blob,
        apikey: result.apiKey,
        model: result.model || 'default-model',
        text: 'Analyze this image for factual content'
      };
      
      // Show loading indicator
      showLoadingIndicator();
      
      // Send to background script
      chrome.runtime.sendMessage(
        { action: 'analyzeImage', data },
        (response: { success: boolean; data?: string; error?: string }) => {
          hideLoadingIndicator();
          
          if (response && response.success) {
            showResultsModal(response.data || '');
          } else {
            showNotification(`Error: ${response?.error || 'Unknown error'}`);
          }
        }
      );
    }, 'image/jpeg', 0.8);
  });
}

// Function to show loading indicator
function showLoadingIndicator(): void {
  const loader = document.createElement('div');
  loader.id = 'factify-loader';
  loader.innerHTML = 'Analyzing...';
  loader.style.position = 'fixed';
  loader.style.top = '50%';
  loader.style.left = '50%';
  loader.style.transform = 'translate(-50%, -50%)';
  loader.style.backgroundColor = '#fff';
  loader.style.padding = '20px';
  loader.style.borderRadius = '8px';
  loader.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  loader.style.zIndex = '10000';
  
  document.body.appendChild(loader);
}

// Function to hide loading indicator
function hideLoadingIndicator(): void {
  const loader = document.getElementById('factify-loader');
  if (loader) {
    document.body.removeChild(loader);
  }
}

// Function to show notification
function showNotification(message: string): void {
  log('Showing notification:', message);
  
  const notification = document.createElement('div');
  notification.id = 'factify-notification';
  notification.innerHTML = message;
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = '#333';
  notification.style.color = '#fff';
  notification.style.padding = '10px 15px';
  notification.style.borderRadius = '4px';
  notification.style.zIndex = '10000';
  notification.style.maxWidth = '300px';
  notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  
  // Remove existing notifications
  const existingNotification = document.getElementById('factify-notification');
  if (existingNotification) {
    document.body.removeChild(existingNotification);
  }
  
  document.body.appendChild(notification);
  
  // Remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      document.body.removeChild(notification);
    }
  }, 5000);
}

// Function to show results modal
function showResultsModal(data: string): void {
  // Create modal container
  const modal = document.createElement('div');
  modal.id = 'factify-results-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.zIndex = '10000';
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = '#fff';
  modalContent.style.borderRadius = '8px';
  modalContent.style.padding = '20px';
  modalContent.style.maxWidth = '80%';
  modalContent.style.maxHeight = '80%';
  modalContent.style.overflowY = 'auto';
  
  // Create close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = 'X';
  closeButton.style.float = 'right';
  closeButton.style.border = 'none';
  closeButton.style.background = 'none';
  closeButton.style.fontSize = '20px';
  closeButton.style.cursor = 'pointer';
  closeButton.onclick = () => document.body.removeChild(modal);
  
  // Create content
  const content = document.createElement('div');
  try {
    // Try to parse as JSON
    const jsonData = JSON.parse(data);
    content.innerHTML = `<h2>Fact Check Results</h2><pre>${JSON.stringify(jsonData, null, 2)}</pre>`;
  } catch (e) {
    // Plain text response
    content.innerHTML = `<h2>Fact Check Results</h2><div>${data}</div>`;
  }
  
  // Assemble modal
  modalContent.appendChild(closeButton);
  modalContent.appendChild(content);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

// Initialize the content script
function init(): void {
  log('FactifyAI content script initialized');
  
  // Listen for text selections
  document.addEventListener('mouseup', handleTextSelection);
  
  // Set up context menu for images
  chrome.runtime.onMessage.addListener((request: any, _sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
    log('Received message in content script:', request);
    
    if (request.action === 'contextMenuClick' && request.target === 'image') {
      const image = document.querySelector(`img[src="${request.srcUrl}"]`) as HTMLImageElement;
      if (image) {
        captureImage(image);
      }
    }
    sendResponse({ success: true });
    return true;
  });
  
  // Check if we can communicate with the background script
  try {
    log('Testing communication with background script');
    chrome.runtime.sendMessage({ action: 'checkHealth' }, response => {
      if (chrome.runtime.lastError) {
        log('Error communicating with background script:', chrome.runtime.lastError);
      } else {
        log('Communication with background script successful', response);
      }
    });
  } catch (error) {
    log('Exception during background script communication test:', error);
  }
}

init();
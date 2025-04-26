// Background Service Worker for FactifyAI
console.log('FactifyAI Background Service Worker loaded');

// Handle context menu creation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'factifyImage',
    title: 'Analyze image with FactifyAI',
    contexts: ['image']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'factifyImage' && info.srcUrl && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'ANALYZE_IMAGE',
      imageUrl: info.srcUrl
    });
  }
});

// Handle messages from content scripts and popup
// eslint-disable-next-line @typescript-eslint/no-unused-vars
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_API_KEY') {
    chrome.storage.local.get(['apiKey'], (result) => {
      sendResponse({ apiKey: result.apiKey || '' });
    });
    return true; // Required for async sendResponse
  } 
  
  if (message.type === 'SET_API_KEY') {
    chrome.storage.local.set({ apiKey: message.apiKey }, () => {
      sendResponse({ success: true });
    });
    return true; // Required for async sendResponse
  }
});

export {};
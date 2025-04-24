// Background script for FactifyAI extension
// Handles context menu creation and management

// Set up context menu for image analysis
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "analyzeImage",
    title: "Analyze Image with FactifyAI",
    contexts: ["image"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "analyzeImage" && tab?.id) {
    // We need to make sure tab.id is defined and assign it to a variable to satisfy TypeScript
    const tabId = tab.id;
    
    // First check if the tab is ready to receive messages
    chrome.tabs.sendMessage(tabId, {action: "ping"}, response => {
      // If we got a response, the content script is running
      if (response && response.pong) {
        // Now send the actual message
        chrome.tabs.sendMessage(tabId, {
          action: "analyzeImage",
          imageUrl: info.srcUrl
        });
      } else {
        // If no response, inject the content script first
        chrome.scripting.executeScript({
          target: {tabId},
          files: ["contentScript.js"]
        }).then(() => {
          // After injecting, wait a moment and then send the message
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, {
              action: "analyzeImage",
              imageUrl: info.srcUrl
            });
          }, 500); // Give the content script time to initialize
        }).catch(err => console.error("Error injecting content script:", err));
      }
    });
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // Handle any communication here
  if (message.action === "getApiKey") {
    chrome.storage.local.get(["apiKey"], (result) => {
      sendResponse({ apiKey: result.apiKey || "" });
    });
    return true; // Required for async sendResponse
  }
  
  // Add a ping handler to check if content script is alive
  if (message.action === "ping") {
    sendResponse({ pong: true });
    return true;
  }
});
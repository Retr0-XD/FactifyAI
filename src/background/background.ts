// Background script for FactifyAI extension
// Handles context menu creation and management

// Set up context menu for image analysis
chrome.runtime.onInstalled.addListener(() => {
  console.log("FactifyAI extension installed/updated");
  
  // Create context menu
  chrome.contextMenus.create({
    id: "analyzeImage",
    title: "Analyze Image with FactifyAI",
    contexts: ["image"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "analyzeImage" && tab?.id) {
    const tabId = tab.id;
    console.log("Context menu clicked for image:", info.srcUrl);
    
    // Try to inject content script if it's not already there
    chrome.scripting.executeScript({
      target: {tabId},
      files: ["contentScript.js"]
    }).then(() => {
      // Wait a moment for content script to initialize
      setTimeout(() => {
        console.log("Sending message to content script");
        chrome.tabs.sendMessage(tabId, {
          action: "analyzeImage",
          imageUrl: info.srcUrl
        }, (response) => {
          // Check for any error in the response
          if (chrome.runtime.lastError) {
            console.error("Error sending message:", chrome.runtime.lastError.message);
          } else {
            console.log("Message sent successfully:", response);
          }
        });
      }, 500);
    }).catch(err => console.error("Error injecting content script:", err));
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background script received message:", message);
  
  // Handle any communication here
  if (message.action === "getApiKey") {
    chrome.storage.local.get(["apiKey"], (result) => {
      sendResponse({ apiKey: result.apiKey || "" });
    });
    return true; // Required for async sendResponse
  }
  
  // Add a ping handler to check if content script is alive
  if (message.action === "ping") {
    console.log("Ping received, sending pong");
    sendResponse({ pong: true });
    return true;
  }
  
  // Default response
  sendResponse({ received: true });
  return true;
});
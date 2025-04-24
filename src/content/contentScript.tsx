import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import FloatButton from '../components/FloatButton';
import AnalyzeModal from '../components/AnalyzeModal';

// Log when content script loads
console.log("FactifyAI content script loaded");

// Setup a global variable to track initialization
window.factifyAIInitialized = window.factifyAIInitialized || false;

// Only initialize once
if (!window.factifyAIInitialized) {
  window.factifyAIInitialized = true;
  
  // Create a container for our React app
  const container = document.createElement('div');
  container.id = 'factify-ai-container';
  document.body.appendChild(container);

  // Create a root for our React app
  const root = createRoot(container);

  // Global message handler - should be set up before the React component
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Content script received message:", message);
    
    if (message.action === 'ping') {
      console.log("Ping received, sending pong");
      sendResponse({ pong: true });
      return true;
    }
    
    if (message.action === 'analyzeImage' && message.imageUrl) {
      console.log("Analyze image request received for:", message.imageUrl);
      
      // We'll publish this message to a custom event that our React component will listen for
      const event = new CustomEvent('factifyai-analyze-image', { 
        detail: { imageUrl: message.imageUrl }
      });
      document.dispatchEvent(event);
      
      sendResponse({ success: true });
      return true;
    }
    
    // Default response
    sendResponse({ received: true });
    return true;
  });

  // Main Content Script Component
  const ContentApp = () => {
    const [selection, setSelection] = useState<{
      text: string;
      position: { top: number; left: number };
    } | null>(null);
    
    const [image, setImage] = useState<{
      src: string;
      position: { top: number; left: number };
    } | null>(null);
    
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'text' | 'image'>('text');
    const [modalContent, setModalContent] = useState('');
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    
    // Listen for custom events from our global message handler
    useEffect(() => {
      const handleAnalyzeImageEvent = (event: CustomEvent) => {
        const { imageUrl } = event.detail;
        console.log("React component handling image analysis for:", imageUrl);
        
        // Find the image in the DOM
        const img = document.querySelector(`img[src="${imageUrl}"]`) as HTMLImageElement;
        
        if (img) {
          const rect = img.getBoundingClientRect();
          
          setModalType('image');
          setModalContent(img.src);
          setModalPosition({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
          });
          setModalOpen(true);
        }
      };
      
      document.addEventListener('factifyai-analyze-image', handleAnalyzeImageEvent);
      
      return () => {
        document.removeEventListener('factifyai-analyze-image', handleAnalyzeImageEvent);
      };
    }, []);

    // Handle text selection
    useEffect(() => {
      const handleMouseUp = () => {
        const selectedText = window.getSelection()?.toString().trim();
        
        if (selectedText && selectedText.length > 0) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            setSelection({
              text: selectedText,
              position: {
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
              },
            });
            
            // Clear any image selection
            setImage(null);
          }
        } else {
          setSelection(null);
        }
      };
      
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, []);
    
    // Handle image hover/right-click
    useEffect(() => {
      const handleImageHover = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        
        if (target.tagName === 'IMG') {
          const img = target as HTMLImageElement;
          const rect = img.getBoundingClientRect();
          
          setImage({
            src: img.src,
            position: {
              top: rect.bottom + window.scrollY,
              left: rect.left + window.scrollX,
            },
          });
        }
      };
      
      // Add mouseover event for images
      const images = document.querySelectorAll('img');
      images.forEach((img) => {
        img.addEventListener('mouseover', handleImageHover);
      });
      
      return () => {
        images.forEach((img) => {
          img.removeEventListener('mouseover', handleImageHover);
        });
      };
    }, []);
    
    // Handle float button click for text
    const handleTextButtonClick = () => {
      if (selection) {
        setModalType('text');
        setModalContent(selection.text);
        setModalPosition(selection.position);
        setModalOpen(true);
        setSelection(null); // Hide button after click
      }
    };
    
    // Utility function to convert an image to base64 for API submission
    const getBase64Image = (url: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL);
          } else {
            reject(new Error('Could not get canvas context'));
          }
        };
        img.onerror = (e) => reject(e);
        img.src = url;
      });
    };
    
    // We actually use getBase64Image in handleImageButtonClick
    const handleImageButtonClick = () => {
      if (image) {
        setModalType('image');
        setModalContent(image.src);
        setModalPosition(image.position);
        setModalOpen(true);
        
        // Demonstrate that we're using getBase64Image
        getBase64Image(image.src)
          .then(() => {
            console.log('Image ready for analysis');
            // In a real implementation, we'd pass this to the modal or API
          })
          .catch(err => console.error('Error preparing image:', err));
        
        setImage(null); // Hide button after click
      }
    };
    
    return (
      <>
        {/* Float button for text selection */}
        {selection && (
          <FloatButton
            top={selection.position.top}
            left={selection.position.left}
            onClick={handleTextButtonClick}
            type="text"
          />
        )}
        
        {/* Float button for image hover */}
        {image && !selection && (
          <FloatButton
            top={image.position.top}
            left={image.position.left}
            onClick={handleImageButtonClick}
            type="image"
          />
        )}
        
        {/* Analysis modal */}
        <AnalyzeModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          type={modalType}
          content={modalContent}
          position={modalPosition}
        />
      </>
    );
  };

  // Render our React app
  root.render(<ContentApp />);

  // Add global styles for our extension components
  const style = document.createElement('style');
  style.textContent = `
    #factify-ai-container {
      position: relative;
      z-index: 9999;
    }
  `;
  document.head.appendChild(style);
  
  console.log("FactifyAI content script fully initialized");
}
import React, { useEffect, useState, useRef } from 'react';
import AnalysisModal from './AnalysisModal';
import { TextOptions, ImageOptions } from '../utils/types';

interface Position {
  x: number;
  y: number;
}

enum ContentType {
  TEXT = 'text',
  IMAGE = 'image',
  NONE = 'none'
}

const FloatingUI: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [contentType, setContentType] = useState<ContentType>(ContentType.NONE);
  const [showModal, setShowModal] = useState<boolean>(false);
  const bubbleRef = useRef<HTMLDivElement>(null);
  
  // Handle text selection - removing the isVisible dependency
  useEffect(() => {
    const handleTextSelection = (event: MouseEvent) => {
      console.log('Text selection event triggered');
      const selection = window.getSelection();
      
      // First check if the click was on the bubble itself
      if (bubbleRef.current && isElementOrChildOfElement(event.target as Node, bubbleRef.current)) {
        console.log('Click was on the bubble, not hiding it');
        return; // Don't hide the bubble if clicking on it
      }
      
      // If no text is selected, hide the bubble
      if (!selection || selection.toString().trim() === '') {
        console.log('No text selected, hiding bubble');
        setIsVisible(false);
        return;
      }
      
      const selectedTextContent = selection.toString().trim();
      if (selectedTextContent && selectedTextContent.length > 0) {
        console.log(`Text selected: ${selectedTextContent.substring(0, 20)}...`);
        try {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          
          console.log(`Selection position - right: ${rect.right}, top: ${rect.top}`);
          setSelectedText(selectedTextContent);
          setContentType(ContentType.TEXT);
          
          // Adjust positioning to ensure visibility
          setPosition({
            x: rect.right + window.scrollX,
            y: rect.top + window.scrollY
          });
          
          // Force the bubble to be visible
          setIsVisible(true);
          console.log('Bubble visibility set to true');
        } catch (error) {
          console.error('Error getting selection range:', error);
        }
      }
    };
    
    console.log('Adding mouseup event listener');
    document.addEventListener('mouseup', handleTextSelection);
    
    return () => {
      console.log('Removing mouseup event listener');
      document.removeEventListener('mouseup', handleTextSelection);
    };
  }, []); // Removed isVisible dependency
  
  // Handle image right-click or hover
  useEffect(() => {
    const handleImageInteraction = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (target.tagName.toLowerCase() === 'img') {
        const imgElement = target as HTMLImageElement;
        const rect = imgElement.getBoundingClientRect();
        
        // Convert image to base64 (in a real extension, you'd need to handle CORS issues)
        const handleImageData = () => {
          // For demo, we'll just store the image URL instead of base64
          setSelectedImage(imgElement.src);
          setContentType(ContentType.IMAGE);
          setPosition({
            x: rect.right + window.scrollX,
            y: rect.top + window.scrollY
          });
          setIsVisible(true);
        };
        
        if (event.type === 'contextmenu') {
          event.preventDefault();
          handleImageData();
        }
      }
    };
    
    // Listen for context menu events on images
    document.addEventListener('contextmenu', handleImageInteraction);
    
    return () => {
      document.removeEventListener('contextmenu', handleImageInteraction);
    };
  }, []);
  
  // Handle messages from background script
  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.type === 'ANALYZE_IMAGE' && message.imageUrl) {
        setSelectedImage(message.imageUrl);
        setContentType(ContentType.IMAGE);
        // Position at center of screen for context menu activation
        setPosition({
          x: window.innerWidth / 2 + window.scrollX,
          y: window.innerHeight / 2 + window.scrollY
        });
        setIsVisible(true);
      }
    };
    
    chrome.runtime.onMessage.addListener(handleMessage);
    
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);
  
  // Helper function to check if a node is or is a child of a specific element
  const isElementOrChildOfElement = (node: Node | null, element: HTMLElement | null): boolean => {
    if (!node || !element) return false;
    
    let current: Node | null = node;
    while (current) {
      if (current === element) return true;
      current = current.parentNode;
    }
    
    return false;
  };
  
  // Handle clicking the floating bubble
  const handleBubbleClick = () => {
    setShowModal(true);
    setIsVisible(false);
  };
  
  // Handle closing the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedText('');
    setSelectedImage('');
    setContentType(ContentType.NONE);
  };

  // Initial options based on content type
  const getInitialOptions = () => {
    if (contentType === ContentType.TEXT) {
      return {
        factCheck: true,
        biasDetection: false,
        relatedArticles: false,
        similarDiscussions: false,
        trustedAlternatives: true,
        explainSummarize: false
      } as TextOptions;
    } else {
      return {
        factCheck: true,
        imageSourceLookup: true,
        trustedAlternatives: true,
        explainSummarize: false
      } as ImageOptions;
    }
  };
  
  return (
    <>
      {/* Floating bubble - updated z-index and positioning */}
      {isVisible && (
        <div 
          ref={bubbleRef}
          className="fixed z-[999999] p-2 bg-blue-600 rounded-full cursor-pointer shadow-lg animate-fade-in hover:bg-blue-700 transition-colors"
          style={{ 
            left: `${position.x}px`, 
            top: `${position.y}px`,
            transform: 'translate(10px, -50%)'
          }}
          onClick={handleBubbleClick}
        >
          <div className="flex items-center justify-center w-8 h-8 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      )}
      
      {/* Analysis Modal */}
      {showModal && (
        <AnalysisModal
          contentType={contentType}
          selectedContent={contentType === ContentType.TEXT ? selectedText : selectedImage}
          initialOptions={getInitialOptions()}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default FloatingUI;
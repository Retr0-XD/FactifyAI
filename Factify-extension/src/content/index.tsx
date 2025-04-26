// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react';
import { createRoot } from 'react-dom/client';
import FloatingUI from './FloatingUI';
import '../index.css';

console.log('FactifyAI content script loaded');

// Initialize the floating UI container
const initializeFloatingUI = () => {
  // Create container for the floating UI
  const floatingContainer = document.createElement('div');
  floatingContainer.id = 'factifyai-floating-container';
  document.body.appendChild(floatingContainer);

  // Render the floating UI component into the container
  const root = createRoot(floatingContainer);
  root.render(<FloatingUI />);
};

// Initialize the extension content script
const initialize = () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFloatingUI);
  } else {
    initializeFloatingUI();
  }
};

initialize();
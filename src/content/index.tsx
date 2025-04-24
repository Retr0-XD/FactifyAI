// This file serves as an entry point for the content script
// It imports the necessary styles and exports relevant components

import './contentScript.tsx'; // This loads the actual content script implementation
import '../styles/content.css';

// We're explicitly exporting these components so they can be used elsewhere if needed
// Even though we're not using them directly in this file
export { default as FloatButton } from '../components/FloatButton';
export { default as AnalyzeModal } from '../components/AnalyzeModal';

console.log('FactifyAI initialized');
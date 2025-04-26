// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react';
import './App.css';

function App() {
  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">FactifyAI Development Page</h1>
      <p className="mb-4 text-gray-700">
        This is the development page for FactifyAI Chrome Extension. The actual extension functionality runs in:
      </p>
      <ul className="list-disc pl-5 mb-4 text-gray-700">
        <li>Background service worker (background.ts)</li>
        <li>Content script (content/index.tsx)</li>
        <li>Popup (popup/Popup.tsx)</li>
      </ul>
      <p className="text-gray-700">
        To test the extension, build it and load it into Chrome from the build directory.
      </p>
    </div>
  );
}

export default App;

# FactifyAI Chrome Extension

FactifyAI is a Chrome Extension that lets users analyze text and images on any webpage using AI-powered fact checking and content analysis.

## Features

- **Text Analysis**: Select text on any webpage and analyze it for fact-checking, bias detection, and more.
- **Image Analysis**: Right-click on images to check authenticity and find original sources.
- **Multiple Analysis Options**:
  - Fact checking
  - Bias detection
  - Related articles lookup
  - Similar discussions finder
  - Trusted alternatives
  - Explanation and summarization
  - Image source lookup

## Project Structure

```
factifyai-extension/
│
├── public/
│   └── icons/              # Extension icons
├── src/
│   ├── content/            # Content scripts
│   │   ├── index.tsx       # Content script entry point
│   │   ├── FloatingUI.tsx  # Floating bubble UI
│   │   └── AnalysisModal.tsx # Analysis results modal
│   ├── popup/              # Extension popup
│   │   ├── index.html      # Popup HTML
│   │   └── Popup.tsx       # Popup component
│   ├── background/         # Background service worker
│   │   └── background.ts   # Background script
│   ├── utils/              # Shared utilities
│   │   ├── api.ts          # API service
│   │   └── types.ts        # TypeScript types
│   └── index.css           # Global styles
├── vite.config.ts          # Vite & extension configuration
└── package.json            # Project dependencies
```

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the following command to start the development server:

```bash
npm run dev
```

### Build

To build the extension for production:

```bash
npm run build
```

The built extension will be in the `dist` directory.

### Loading in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked" and select the `dist` directory
4. The extension should now be installed and visible in the toolbar

## Usage

1. Select text or right-click on an image on any webpage
2. Click on the FactifyAI bubble that appears
3. Choose which analysis options you want to enable
4. Click "Analyze" to get AI-powered insights
5. View the results directly in the modal

## API Keys

This extension requires an API key to function correctly. You can add your API key through the extension popup by clicking on the FactifyAI icon in the toolbar.

## Testing the Extension

Now that the extension has been successfully built, follow these steps to test it in Chrome:

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" using the toggle in the top-right corner
3. Click "Load unpacked" and select the `dist` directory from this project
4. The FactifyAI extension should now be installed and visible in your Chrome toolbar

### How to Use

1. Navigate to any webpage
2. Select text: Highlight any text on the webpage and a FactifyAI bubble will appear
3. Analyze images: Right-click on any image to access FactifyAI through the context menu
4. Click on the FactifyAI bubble that appears
5. Choose which analysis options you want to enable
6. Click "Analyze" to get AI-powered insights about the selected content
7. View the results directly in the modal that appears

### Configuration

Click on the FactifyAI icon in the Chrome toolbar to access the extension popup, where you can:
- Enter your API key for the service
- View your usage statistics
- Reset your settings if needed

## Development Notes

This extension is currently using a dummy API implementation for demonstration purposes. In a production environment, you would replace the API implementations in `src/utils/api.ts` with actual API calls to your backend service.

## Troubleshooting

If you encounter any issues while loading or using the extension:

1. Make sure you have selected the correct `dist` directory
2. Check the browser console for any JavaScript errors
3. Try refreshing the page or reloading the extension

# FactifyAI Chrome Extension

A Chrome extension that helps users analyze and fact-check content on the web.

## Features

- **Text Analysis**: Select any text on a webpage and analyze it for factual accuracy, bias, and more.
- **Image Analysis**: Analyze images for source verification and trusted alternatives.
- **Direct UI**: Results appear directly in a modal on the current page.
- **Multiple Analysis Options**: Various analysis options including fact-checking, bias detection, and finding trusted alternatives.
- **Simple API Integration**: Use your HuggingFace or other AI API keys to power the analysis.

## Installation

### For Development

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Build the extension:
   ```
   npm run build
   ```
4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` directory

### For Users (When Published)

1. Visit the Chrome Web Store
2. Search for "FactifyAI"
3. Click "Add to Chrome"

## Usage

### Text Analysis

1. Select any text on a webpage
2. Click the FactifyAI button that appears
3. Choose your analysis options
4. Click "Analyze" to see results

### Image Analysis

1. Hover over any image on a webpage
2. Click the FactifyAI button that appears
3. Or right-click on an image and select "Analyze with FactifyAI"
4. Choose your analysis options
5. Click "Analyze" to see results

## Configuration

Open the extension popup from the Chrome toolbar to:

- Enter your API key
- View usage statistics
- Reset data
- Access help and instructions

## Development

- `npm run dev` - Run in development mode
- `npm run build` - Build for production
- `npm run preview` - Preview the production build

## Project Structure

```
factifyai-extension/
├── public/             # Static assets
├── src/
│   ├── background/     # Background script
│   ├── content/        # Content script
│   ├── popup/          # Popup UI
│   ├── components/     # Shared components
│   ├── utils/          # Utility functions
│   └── styles/         # CSS styles
├── manifest.json       # Extension manifest
├── vite.config.ts      # Build configuration
└── package.json        # Dependencies
```

## License

MIT
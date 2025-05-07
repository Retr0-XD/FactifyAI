#!/bin/bash

echo "📋 Running basic health check for FactifyAI Chrome Extension..."

# Check if the build directory exists
if [ ! -d "./dist" ]; then
  echo "❌ Error: dist directory not found. Run 'npm run build' first."
  exit 1
fi

# Check if the main components exist
if [ ! -f "./dist/manifest.json" ]; then
  echo "❌ Error: manifest.json not found in dist directory."
  exit 1
fi

# Check for background script
if [ ! -f "./dist/assets/background.js" ]; then
  echo "❌ Error: Background script not found."
  exit 1
fi

# Check for content script
if [ ! -f "./dist/assets/content.js" ]; then
  echo "❌ Error: Content script not found."
  exit 1
fi

# Check for popup
if [ ! -f "./dist/assets/popup.js" ]; then
  echo "❌ Error: Popup script not found."
  exit 1
fi

# Check manifest content
echo "✓ Checking manifest.json content..."
cat ./dist/manifest.json | grep "FactifyAI"
if [ $? -ne 0 ]; then
  echo "❌ Error: manifest.json doesn't contain extension name."
  exit 1
fi

echo "✅ Basic health check passed! All essential files are present."
echo "🔍 To fully test the extension, you'll need to load it in Chrome."
echo "📝 Instructions for loading in Chrome:"
echo "   1. Go to chrome://extensions/"
echo "   2. Enable 'Developer mode'"
echo "   3. Click 'Load unpacked'"
echo "   4. Select the 'dist' directory in your project"

exit 0
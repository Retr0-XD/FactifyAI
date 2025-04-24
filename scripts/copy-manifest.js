// Copy manifest.json and assets to dist folder
import { copyFileSync, mkdirSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

function ensureDirectoryExistence(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

// Ensure the dist directory exists
ensureDirectoryExistence('./dist');

// Copy manifest
copyFileSync('./manifest.json', './dist/manifest.json');

// Create icons directory in dist
ensureDirectoryExistence('./dist/icons');

// Copy icons
const iconDir = './public/icons';
if (existsSync(iconDir)) {
  const iconFiles = readdirSync(iconDir);
  iconFiles.forEach(file => {
    copyFileSync(path.join(iconDir, file), path.join('./dist/icons', file));
  });
  console.log('Icons copied to dist folder');
}

// Move popup HTML file to root if needed
const popupHtmlSrc = './dist/src/popup/index.html';
const popupHtmlDst = './dist/popup.html';
if (existsSync(popupHtmlSrc)) {
  try {
    // Read the HTML file
    let htmlContent = readFileSync(popupHtmlSrc, 'utf8');
    
    // Fix paths - remove leading slash from all resource paths
    htmlContent = htmlContent.replace(/src="\/([^"]+)"/g, 'src="$1"');
    htmlContent = htmlContent.replace(/href="\/([^"]+)"/g, 'href="$1"');
    
    // Write the fixed HTML file to destination
    writeFileSync(popupHtmlDst, htmlContent);
    console.log('Popup HTML moved to the root of dist folder with fixed paths');
  } catch (err) {
    console.error('Error moving popup HTML:', err);
  }
}

console.log('Manifest and assets copied to dist folder');
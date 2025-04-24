import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Shared base configuration
const baseConfig = {
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
};

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Determine which build configuration to use based on environment variables
  const buildTarget = process.env.BUILD_TARGET || 'all';

  if (buildTarget === 'popup') {
    return {
      ...baseConfig,
      build: {
        outDir: 'dist',
        rollupOptions: {
          input: {
            popup: resolve(__dirname, 'src/popup/index.html'),
          },
          output: {
            entryFileNames: '[name].js',
            assetFileNames: (assetInfo) => {
              if (assetInfo.name === 'index.html') {
                return 'popup.html';
              }
              return 'assets/[name].[hash].[ext]';
            },
          },
        },
      },
    };
  } 
  
  if (buildTarget === 'content') {
    return {
      ...baseConfig,
      build: {
        outDir: 'dist',
        emptyOutDir: false,
        lib: {
          entry: resolve(__dirname, 'src/content/contentScript.tsx'),
          name: 'contentScript',
          formats: ['iife'],
          fileName: () => 'contentScript.js',
        },
      },
    };
  }
  
  if (buildTarget === 'background') {
    return {
      ...baseConfig,
      build: {
        outDir: 'dist',
        emptyOutDir: false,
        lib: {
          entry: resolve(__dirname, 'src/background/background.ts'),
          name: 'background',
          formats: ['iife'],
          fileName: () => 'background.js',
        },
      },
    };
  }
  
  // Default all targets
  return {
    ...baseConfig,
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          popup: resolve(__dirname, 'src/popup/index.html'),
        },
      },
    },
  };
});
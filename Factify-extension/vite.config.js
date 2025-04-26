import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import webExtension from '@samrum/vite-plugin-web-extension';
import path from 'path';
// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        webExtension({
            manifest: {
                manifest_version: 3,
                name: "FactifyAI",
                version: "1.0.0",
                description: "AI-powered fact checking for text and images",
                action: {
                    default_popup: "src/popup/index.html",
                    default_icon: {
                        "16": "icons/icon.svg",
                        "48": "icons/icon.svg",
                        "128": "icons/icon.svg"
                    }
                },
                permissions: [
                    "activeTab",
                    "scripting",
                    "storage",
                    "contextMenus"
                ],
                host_permissions: ["<all_urls>"],
                content_scripts: [
                    {
                        matches: ["<all_urls>"],
                        js: ["src/content/index.tsx"],
                        css: ["src/index.css"]
                    }
                ],
                background: {
                    service_worker: "src/background/background.ts",
                    type: "module"
                },
                icons: {
                    "16": "icons/icon.svg",
                    "48": "icons/icon.svg",
                    "128": "icons/icon.svg"
                }
            }
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    build: {
        sourcemap: true,
        emptyOutDir: true
    }
});

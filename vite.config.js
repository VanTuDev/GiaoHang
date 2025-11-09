import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
   plugins: [
      react(),
      VitePWA({
         registerType: 'prompt',
         includeAssets: ['favicon.ico', 'logo.svg', '/logo/*.png'],
         manifest: {
            name: 'POS Bahung - Hệ thống quản lý bán hàng',
            short_name: 'POS Bahung',
            description: 'Hệ thống quản lý bán hàng dành cho doanh nghiệp vừa và nhỏ',
            theme_color: '#4a90e2',
            background_color: '#ffffff',
            start_url: '/login',
            display: 'standalone',
            icons: [
               {
                  src: '/logo.svg',
                  sizes: '192x192 512x512',
                  type: 'image/svg+xml',
                  purpose: 'any maskable'
               }
            ]
         },
         workbox: {
            // Tăng giới hạn file size để cache file lớn (10MB)
            maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
            // Bỏ qua file lớn trong precache, sẽ cache runtime
            globIgnores: ['**/node_modules/**/*'],
            runtimeCaching: [
               {
                  urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                  handler: 'CacheFirst',
                  options: {
                     cacheName: 'google-fonts-cache',
                     expiration: {
                        maxEntries: 10,
                        maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                     },
                     cacheableResponse: {
                        statuses: [0, 200]
                     }
                  }
               },
               {
                  urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
                  handler: 'CacheFirst',
                  options: {
                     cacheName: 'images-cache',
                     expiration: {
                        maxEntries: 50,
                        maxAgeSeconds: 60 * 60 * 24 * 30 // <== 30 days
                     }
                  }
               },
               {
                  urlPattern: /^https:\/\/api\.*/i,
                  handler: 'NetworkFirst',
                  options: {
                     cacheName: 'api-cache',
                     expiration: {
                        maxEntries: 10,
                        maxAgeSeconds: 60 * 60 // <== 1 hour
                     },
                     networkTimeoutSeconds: 10
                  }
               }
            ]
         },
         devOptions: {
            enabled: true,
            type: 'module',
            navigateFallback: 'index.html'
         }
      })
   ],
   resolve: {
      alias: {
         '@': path.resolve(__dirname, './src'),
      },
   },
   server: {
      port: 3000,
      open: true,
      host: '0.0.0.0',
      strictPort: true,
      // Proxy chỉ dùng trong development
      // Production sẽ dùng VITE_API_BASE_URL từ biến môi trường
      proxy: {
         '/api': {
            target: process.env.VITE_API_BASE_URL || 'http://localhost:8080',
            changeOrigin: true,
            secure: false,
         }
      },
   },
}); 
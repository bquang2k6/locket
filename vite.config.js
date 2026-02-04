import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    allowedHosts: ['test.locket-wan.top'],
    host: true, // Hoặc '0.0.0.0'
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
  build: {
    // Thêm hash vào tên file để cache busting
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    // Tạo source map cho production
    sourcemap: true,
    // Tối ưu hóa chunk size
    chunkSizeWarningLimit: 1000
  },
  plugins: [
    tailwindcss(),
    react(),
  ],
})
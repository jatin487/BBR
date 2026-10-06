import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    // Target modern browsers for smaller, faster bundles
    target: 'es2020',
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Raise the chunk-size warning threshold
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split vendor chunks for better caching
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return;
          if (id.includes('firebase')) return 'vendor-firebase';
          if (id.includes('@supabase')) return 'vendor-supabase';
          if (id.includes('framer-motion')) return 'vendor-framer';
          if (id.includes('lucide-react')) return 'vendor-icons';
          if (id.includes('three') || id.includes('@react-three')) return 'vendor-three';
          if (id.includes('/react/') || id.includes('/react-dom/')) return 'vendor-react';
        }
      }
    }
  },
  // Add image optimization hints
  assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.webp', '**/*.avif', '**/*.svg']
})

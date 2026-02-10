import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Resolve slow-mode from workspace (built dist)
  resolve: {
    preserveSymlinks: true,
  },
  server: {
    port: 5174,
  },
});

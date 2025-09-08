import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 5173, // Standard Vite port
    strictPort: true, // Fail if port is already in use
    open: true, // Open browser automatically
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Better error handling for development
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignore certain warnings in development
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        warn(warning);
      },
    },
  },
}));

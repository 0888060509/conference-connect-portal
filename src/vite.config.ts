
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // This is required for bcrypt and jwt libraries that use Node.js globals
    'process.env': {}
  },
  optimizeDeps: {
    // These packages are designed for Node.js and won't work properly in the browser
    // We'll need to implement alternatives or use a backend service
    exclude: ['pg']
  }
}));

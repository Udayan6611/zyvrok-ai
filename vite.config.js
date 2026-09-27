import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        repurpose_studio: resolve(__dirname, 'repurpose_studio_responsive/code.html'),
        login_sign_up: resolve(__dirname, 'login_sign_up_responsive/code.html'),
        upgrade_to_pro: resolve(__dirname, 'upgrade_to_pro_responsive/code.html'),
        dashboard_history: resolve(__dirname, 'dashboard_history_responsive/code.html'),
        history: resolve(__dirname, 'history_responsive/code.html'),
        auth: resolve(__dirname, 'auth_responsive/code.html'),
        landing_page: resolve(__dirname, 'landing_page_responsive/code.html'),
        legal: resolve(__dirname, 'legal.html')
      }
    }
  }
});

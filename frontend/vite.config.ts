import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
  
  allowedHosts: [
      'localhost',
      '.ngrok.io',
      '.ngrok-free.app',
      'c3d1ef079a9b.ngrok-free.app' // 👈 ADD EXACT NGROK URL
    ]}
    

});


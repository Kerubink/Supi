import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
   server: {
    host: true, // Isso permite que o servidor seja acessível por outras IPs na rede
    port: 5173, // Ou a porta que você configurou, padrão do Vite
  },
})

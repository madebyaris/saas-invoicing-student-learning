import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['@tanstack/react-router', '@tanstack/react-query'],
          'ui-vendor': ['lucide-react', 'date-fns'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'table-vendor': ['@tanstack/react-table'],
          'chart-vendor': ['recharts'],
          
          // Feature chunks
          'dashboard': ['./src/app/dashboard.tsx'],
          'invoices': ['./src/app/invoices.tsx', './src/app/invoice-detail.tsx'],
          'clients': ['./src/app/clients.tsx', './src/app/client-detail.tsx'],
          'analytics': ['./src/app/analytics.tsx'],
          'payments': ['./src/app/payments.tsx'],
          'settings': ['./src/app/settings.tsx'],
          
          // Component chunks
          'invoice-components': [
            './src/components/invoices/InvoicesTable.tsx',
            './src/components/invoices/NewInvoiceDialog.tsx'
          ],
          'client-components': [
            './src/components/clients/ClientsTable.tsx',
            './src/components/clients/ClientDialog.tsx'
          ],
          'ui-components': [
            './src/components/ui/button.tsx',
            './src/components/ui/card.tsx',
            './src/components/ui/dialog.tsx',
            './src/components/ui/form.tsx',
            './src/components/ui/input.tsx',
            './src/components/ui/select.tsx',
            './src/components/ui/table.tsx',
            './src/components/ui/badge.tsx',
            './src/components/ui/separator.tsx',
            './src/components/ui/tabs.tsx',
            './src/components/ui/textarea.tsx',
            './src/components/ui/chart.tsx'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1MB for better chunking
  },
})

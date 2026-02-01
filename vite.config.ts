import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Merge .env.example as defaults if no .env or .env.local exists
 * This allows developers to run the project without copying .env.example
 */
function ensureEnvDefaults(root: string): void {
  const envPath = path.resolve(root, '.env')
  const envLocalPath = path.resolve(root, '.env.local')
  const envExamplePath = path.resolve(root, '.env.example')
  
  // If neither .env nor .env.local exists, but .env.example does
  if (!fs.existsSync(envPath) && !fs.existsSync(envLocalPath) && fs.existsSync(envExamplePath)) {
    console.log('ℹ️  No .env found - using .env.example as defaults')
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const root = process.cwd()
  
  // Ensure env defaults are available
  ensureEnvDefaults(root)
  
  // Load env files - Vite handles .env, .env.local, .env.[mode], .env.[mode].local
  // For .env.example, we need to load it manually as fallback
  let env = loadEnv(mode, root, '')
  
  // If VITE_API_BASE_URL is not set, try to load from .env.example
  if (!env.VITE_API_BASE_URL) {
    const envExamplePath = path.resolve(root, '.env.example')
    if (fs.existsSync(envExamplePath)) {
      const envExampleContent = fs.readFileSync(envExamplePath, 'utf-8')
      const match = envExampleContent.match(/VITE_API_BASE_URL=(.*)/)
      if (match) {
        env = { ...env, VITE_API_BASE_URL: match[1].trim() }
        console.log('✅ Loaded VITE_API_BASE_URL from .env.example:', env.VITE_API_BASE_URL)
      }
    }
  }
  
  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
    ],
    
    // Define env variables for client code
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || 'http://localhost:4000/api'),
      'import.meta.env.VITE_APP_ENV': JSON.stringify(env.VITE_APP_ENV || 'development'),
    },
    
    server: {
      port: 5173,
    },
    
    preview: {
      port: 4173,
    },
    
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
    },
  }
})

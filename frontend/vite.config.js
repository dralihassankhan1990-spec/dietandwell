import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), 'VITE_')
    const backendOrigin = new URL(env.VITE_API_URL || 'http://localhost:8000/api').origin
    return {
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: 3100,
        strictPort: true,
        proxy: {
            '/api': {
                target: backendOrigin,
                changeOrigin: true,
            },
        }
    },
    esbuild: {
        loader: "jsx",
        include: /src\/.*\.jsx?$/,
        exclude: [],
    },
    optimizeDeps: {
        esbuildOptions: {
            loader: {
                '.js': 'jsx',
            },
        },
    },
    }
})

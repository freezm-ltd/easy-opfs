import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        minify: false,
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'easy-opfs',
            fileName: 'index'
        },
        rollupOptions: {
            external: [],
            output: {
                globals: {
                    
                }
            }
        }
    }
})
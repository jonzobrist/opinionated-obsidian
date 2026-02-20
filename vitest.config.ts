import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
        alias: {
            'obsidian': '/Users/zob/src/opinionated-obsidian/src/test/obsidian-mock.ts'
        }
    },
});

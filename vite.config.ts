import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import laravel from 'laravel-vite-plugin';
import { defineConfig, loadEnv } from 'vite';

import fs from 'fs';

export default(mode: string) => {
    process.env = {...process.env, ...loadEnv(mode, process.cwd(), '')};

    return defineConfig({
        server: {
            host: true,
            port: Number(process.env.VITE_PORT),
            hmr: {
                host: process.env.APP_HOST,
            },
            https: {
                key: fs.readFileSync(process.env.VITE_HTTPS_KEY!),
                cert: fs.readFileSync(process.env.VITE_HTTPS_CERT!),
            },
            watch: {
                usePolling: true,
            }
        },
        plugins: [
            laravel({
                input: ['resources/js/app.ts'],
                ssr: 'resources/js/ssr.ts',
                refresh: true,
            }),
            tailwindcss(),
            vue({
                template: {
                    transformAssetUrls: {
                        base: null,
                        includeAbsolute: false,
                    },
                },
            }),
            wayfinder({
                formVariants: true,
            }),
        ],
    });
}

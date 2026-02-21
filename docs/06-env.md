# 細かい設定を `.env` で設定

## Laravel 本体の設定

`.env`

```diff
- APP_NAME=Laravel
+ APP_NAME=laravel-docker-vite-sample
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_HOST=env2.local.nazki0325.net
APP_URL=https://env2.local.nazki0325.net

- APP_LOCALE=en
+ APP_LOCALE=ja
APP_FALLBACK_LOCALE=en
- APP_FAKER_LOCALE=en_US
+ APP_FAKER_LOCALE=ja_JP
```

## `.env`

```diff
# vite 設定
+ VITE_PORT=50173
ASSET_URL=https://env2.local.nazki0325.net
+ VITE_HTTPS_KEY=/ssl/env2.local.nazki0325.net+1-key.pem
+ VITE_HTTPS_CERT=/ssl/env2.local.nazki0325.net+1.pem
```

## `vite.config.ts`

```diff
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import laravel from 'laravel-vite-plugin';
import { defineConfig, loadEnv } from 'vite';

import fs from 'fs';

export default({ mode }) => {
    process.env = {...process.env, ...loadEnv(mode, process.cwd(), '')};

    return defineConfig({
        server: {
            host: true,
-           port: 50173,
+           port: process.env.VITE_PORT,
            hmr: {
-               host: 'env2.local.nazki0325.net',
+               host: process.env.APP_HOST,
            },
            https: {
-               key: fs.readFileSync(`/ssl/env2.local.nazki0325.net+1-key.pem`),
-               cert: fs.readFileSync(`/ssl/env2.local.nazki0325.net+1.pem`),
+               key: fs.readFileSync(process.env.VITE_HTTPS_KEY),
+               cert: fs.readFileSync(process.env.VITE_HTTPS_CERT),
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
```

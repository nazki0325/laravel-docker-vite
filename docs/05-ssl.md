# SSL 設定

## 証明書を作成

ここでは mkcert を使用

```
PS C:\Users\nazki\laravel-docker-vite> mkcert env2.local.nazki0325.net "*.env2.local.nazki0325.net"
```

## pem ファイルの設置

生成された pem ファイルを `docker/ssl/` 以下に設置。
ホストにリバースプロキシを設置している場合は、そちらも各自で追加。

### `docker-compose.yml`

```diff
volumes:
    vendor:
    node_modules:

services:
    cli:
        build:
            context: ./docker/cli
        depends_on:
            - mariadb
        volumes:
            - .:/src
            - node_modules:/src/node_modules
            - vendor:/src/vendor
    nginx:
        build:
            context: ./docker/nginx
        depends_on:
            - fpm
        ports:
            - 50000:80
        volumes:
            - ./public:/src/public
            - ./docker/nginx/logs:/logs
    fpm:
        build:
            context: ./docker/fpm
        depends_on:
            - mariadb
        ports:
            - 50173:50173
        volumes:
            - .:/src
            - node_modules:/src/node_modules
            - vendor:/src/vendor
+           - ./docker/ssl:/ssl
    mariadb:
        image: mariadb:latest
        volumes:
            - ./docker/mariadb/data:/var/lib/mysql
        environment:
            MYSQL_DATABASE: ${DB_DATABASE}
            MYSQL_USER: ${DB_USERNAME}
            MYSQL_PASSWORD: ${DB_PASSWORD}
            MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
```

### `vite.config.ts`

```diff
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import laravel from 'laravel-vite-plugin';
import { defineConfig, loadEnv } from 'vite';

+ import fs from 'fs';

export default({ mode }) => {
    process.env = {...process.env, ...loadEnv(mode, process.cwd(), '')};

    return defineConfig({
        server: {
            host: true,
            port: 50173,
            hmr: {
                host: 'localhost',
            },
+           https: {
+               key: fs.readFileSync(`/ssl/env2.local.nazki0325.net+1-key.pem`),
+               cert: fs.readFileSync(`/ssl/env2.local.nazki0325.net+1.pem`),
+           },
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

### `.env`

```diff
APP_NAME=Laravel
APP_ENV=local
APP_KEY=
APP_DEBUG=true
- APP_URL=http://localhost:50000
+ APP_HOST=env2.local.nazki0325.net
+ APP_URL=https://env2.local.nazki0325.net

(以下略)
```

## `npm run build` 時の対応

以下の設定をしないと、ブラウザで「HTTPS のページなのに HTTP が使われている」的なエラーが出る

```diff
# vite 設定
+ ASSET_URL=https://env2.local.nazki0325.net

APP_NAME=Laravel
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_HOST=env2.local.nazki0325.net
APP_URL=https://env2.local.nazki0325.net

(以下略)
```

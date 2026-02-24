# 細かい設定を調整

設定の値を `.env` に追い出し、変数化していく。

## Laravel 本体の設定

### `.env`

```diff
- APP_NAME=Laravel
+ APP_NAME=laravel-docker-vite-sample
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_HOST=env-sample.nazki0325.net
APP_URL=https://env-sample.nazki0325.net

- APP_LOCALE=en
+ APP_LOCALE=ja
APP_FALLBACK_LOCALE=en
- APP_FAKER_LOCALE=en_US
+ APP_FAKER_LOCALE=ja_JP
```

## タイムゾーン

### `.env`

```diff
APP_NAME=laravel-docker-vite-sample
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_HOST=env-sample.nazki0325.net
APP_URL=https://env-sample.nazki0325.net
+ APP_TIMEZONE=Asia/Tokyo

APP_LOCALE=ja
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=ja_JP
```

### `docker-compose.yml`

```diff
volumes:
    vendor:
    node_modules:

services:
    app:
        build:
            context: ./docker/app
        depends_on:
            - mariadb
        volumes:
            - .:/src
            - node_modules:/src/node_modules
            - vendor:/src/vendor
+       environment:
+           TZ: ${APP_TIMEZONE}
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
+       environment:
+           TZ: ${APP_TIMEZONE}
    fpm:
        build:
            context: ./docker/fpm
        depends_on:
            - mariadb
        volumes:
            - .:/src
            - node_modules:/src/node_modules
            - vendor:/src/vendor
+       environment:
+           TZ: ${APP_TIMEZONE}
    mariadb:
        image: mariadb:latest
        volumes:
            - ./docker/mariadb/data:/var/lib/mysql
        environment:
+           TZ: ${APP_TIMEZONE}
            MYSQL_DATABASE: ${DB_DATABASE}
            MYSQL_USER: ${DB_USERNAME}
            MYSQL_PASSWORD: ${DB_PASSWORD}
            MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
    phpmyadmin:
        image: phpmyadmin/phpmyadmin
        depends_on:
            - mariadb
        restart: always
        environment:
+           TZ: ${APP_TIMEZONE}
            PMA_HOST: mariadb
            PMA_USER: root
            PMA_PASSWORD: ${DB_ROOT_PASSWORD}
        ports:
            - 50001:80
        volumes:
            - ./docker/phpmyadmin/sessions:/sessions
```

## Vite 設定

### `.env`

```diff
(略)

# vite 設定
VITE_APP_NAME="${APP_NAME}"
+ VITE_PORT=50173
- ASSET_URL=https://env-sample.nazki0325.net
+ ASSET_URL="${APP_URL}"
+ VITE_HTTPS_KEY=/ssl/env-sample.nazki0325.net+1-key.pem
+ VITE_HTTPS_CERT=/ssl/env-sample.nazki0325.net+1.pem
```

### `docker-compose.yml

```diff
(略)

    app:
        build:
            context: ./docker/app
        depends_on:
            - mariadb
+           args:
+               VITE_PORT: ${VITE_PORT}
        ports:
-           - 50173:50173
+           - ${VITE_PORT}:${VITE_PORT}
        volumes:
            - .:/src
            - node_modules:/src/node_modules
            - vendor:/src/vendor
            - ./docker/ssl:/ssl
        environment:
            TZ: ${APP_TIMEZONE}

(略)
```

### `vite.config.ts`

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
            cors: {
                origin: [
                    'https://env-sample.nazki0325.net',
                    'https://v1.env-sample.nazki0325.net',
                    'https://v2.env-sample.nazki0325.net'
                ],
                credentials: true,
            },
            hmr: {
                protocol: 'wss',
-               host: 'env-sample.nazki0325.net',
+               host: process.env.APP_HOST,
            },
            hmr: {
            },
            https: {
-               key: fs.readFileSync(`/ssl/env-sample.nazki0325.net+1-key.pem`),
-               cert: fs.readFileSync(`/ssl/env-sample.nazki0325.net+1.pem`),
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

### `docker/app/Dockerfile`

```diff
FROM php:8.4-cli

- EXPOSE 50173
+ EXPOSE ${VITE_PORT}

(略)
```

## ポート設定

### `.env`

```diff
# vite 設定
VITE_PORT=50173
ASSET_URL=https://env-sample.nazki0325.net
VITE_HTTPS_KEY=/ssl/env-sample.nazki0325.net+1-key.pem
VITE_HTTPS_CERT=/ssl/env-sample.nazki0325.net+1.pem

APP_NAME=laravel-docker-vite-sample
APP_ENV=local
APP_KEY=
APP_DEBUG=true
+ APP_PORT=50000
APP_HOST=env-sample.nazki0325.net
APP_URL=https://env-sample.nazki0325.net
APP_TIMEZONE=Asia/Tokyo

+ # phpmyadmin 設定
+ PHPMYADMIN_PORT=50001
```

### `docker-compose.yml`

```diff
(略)

    nginx:
        build:
            context: ./docker/nginx
        depends_on:
            - fpm
        ports:
-           - 50000:80
+           - ${APP_PORT}:80
        volumes:
            - ./public:/src/public
            - ./docker/nginx/logs:/logs
        environment:
            TZ: ${APP_TIMEZONE}

(略)

    phpmyadmin:
        image: phpmyadmin/phpmyadmin
        depends_on:
            - mariadb
        restart: always
        environment:
            TZ: ${APP_TIMEZONE}
            PMA_HOST: mariadb
            PMA_USER: root
            PMA_PASSWORD: ${DB_ROOT_PASSWORD}
        ports:
-           - 50001:80
+           - "${PHPMYADMIN_PORT}:80"
        volumes:
            - ./docker/phpmyadmin/sessions:/sessions
```

## PHP のバージョン統一

### `.env`

```diff
+ # app, fpm 両コンテナの PHP バージョン
+ PHP_VER=8.4
```

### `docker-compose.yml`

```diff
(略)

    app:
        build:
            context: ./docker/app
+           args:
+               PHP_VER: ${PHP_VER}
        depends_on:
            - mariadb
        volumes:
            - .:/src
            - node_modules:/src/node_modules
            - vendor:/src/vendor
        environment:
            TZ: ${APP_TIMEZONE}

(略)

    fpm:
        build:
            context: ./docker/fpm
            args:
+               PHP_VER: ${PHP_VER}
                VITE_PORT: ${VITE_PORT}
        depends_on:
            - mariadb
        ports:
            - ${VITE_PORT}:${VITE_PORT}
        volumes:
            - .:/src
            - node_modules:/src/node_modules
            - vendor:/src/vendor
            - ./docker/ssl:/ssl
        environment:
            TZ: ${APP_TIMEZONE}

(略)
```

### `docker/app/Dockerfile`

```diff
- FROM php:8.4-cli
+ ARG PHP_VER=8.4
+ FROM php:${PHP_VER}-cli

(略)
```

### `docker/fpm/Dockerfile`

```diff
- FROM php:8.4-fpm
+ ARG PHP_VER=8.4
+ FROM php:${PHP_VER}-fpm

(略)
```

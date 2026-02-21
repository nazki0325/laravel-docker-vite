# Vite 設定

`fpm` コンテナに npm をセットアップ、
Vite はポート `50173` で動作させる想定

※※ Laravel 12 は **node 20.19** 以上が必要

## `docker/fpm/Dockerfile`

```diff
FROM php:8.4-fpm

+ EXPOSE 50173

RUN apt-get update \
    && apt-get install -y \
    git \
    zip \
    unzip \
    libmcrypt-dev \
    libzip-dev

RUN docker-php-ext-install zip
RUN docker-php-ext-install bcmath
RUN docker-php-ext-install pdo_mysql mysqli exif

+ ENV NODE_VERSION=20.19.0
+ RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
+ ENV NVM_DIR=/root/.nvm
+ RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
+ RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
+ RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
+ ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
+ RUN node --version
+ RUN npm --version

WORKDIR /src
ENTRYPOINT [ "bash", "-c", "exec php-fpm" ]
```

## `docker-compose.yml`

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
+       ports:
+           - 50173:50173
        volumes:
            - .:/src
            - node_modules:/src/node_modules
            - vendor:/src/vendor
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

## `.env`

```diff
+ # ポート設定
+ VITE_PORT=50173

APP_NAME=Laravel
APP_ENV=local
APP_KEY=
APP_DEBUG=true
+ APP_HOST=localhost
- APP_URL=http://localhost
+ APP_URL=http://localhost:50000
```

## npm 起動

```
PS C:\Users\nazki\laravel-docker-vite> docker compose exec fpm npm install
PS C:\Users\nazki\laravel-docker-vite> docker compose exec fpm npm run dev
```

`npm install` でコケる場合、`node_modules` のボリュームを誰かが掴んでる可能性がある。
`docker compose run` を使ってる場合に陥りやすい

## Vite のポート番号変更

`vite.config.ts`

```diff
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import laravel from 'laravel-vite-plugin';
- import { defineConfig } from 'vite';
+ import { defineConfig, loadEnv } from 'vite';

- export default defineConfig({
+ export default({ mode }) => {
+   process.env = {...process.env, ...loadEnv(mode, process.cwd(), '')};

+   return defineConfig({
+       server: {
+           host: true,
+           port: 50173,
+           hmr: {
+               host: 'localhost',
+           },
+           watch: {
+               usePolling: true,
+           }
+       },
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
+ }
```

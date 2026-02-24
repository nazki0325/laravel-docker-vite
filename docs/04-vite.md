# Vite 設定

## `app` コンテナに npm をセットアップ

Vite はポート `50173` で動作させる想定。
**Laravel 12 は node 20.19 以上が必要。**

最初は npm を独立コンテナにしようと思っていたが、あまりに依存関係が複雑だったため断念。
結局 Sail っぽくなった。

### `docker/app/Dockerfile`

```diff
FROM php:8.4-cli

+ EXPOSE 50173

RUN apt-get update
RUN apt-get install -y git zip unzip

# composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV PATH="/root/.composer/vendor/bin:${PATH}"

+ # node
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
ENTRYPOINT [ "bash", "-c", "tail -f /dev/null" ]
```

### `docker-compose.yml`

```diff
(略)

    app:
        build:
            context: ./docker/app
        depends_on:
            - mariadb
+       ports:
+           - 50173:50173
        volumes:
            - .:/src
            - node_modules:/src/node_modules
            - vendor:/src/vendor

(略)
```

### `.env`

```diff
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
PS C:\Users\nazki\laravel-docker-vite> docker compose exec app npm install
PS C:\Users\nazki\laravel-docker-vite> docker compose exec app npm run dev
```

`npm install` でコケる場合、`node_modules` のボリュームを誰かが掴んだままになっている可能性がある。
`docker compose run` を使ってる場合に陥りやすい。
(`--rm` を付けないと、ボリュームを掴んだままコンテナが落ちるため)

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

**`.gitignore` で `resources` 配下のファイルを除外していると、tailwind の出力が狂う可能性がある。**
tailwind は ignore されていないファイルだけをコンパイルする特性があるらしい。

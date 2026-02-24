# SSL 設定

## 独自ドメイン設定

ホストマシンにリバースプロキシを入れており、`env-sample.nazki0325.net` → `localhost:50000` となるよう設定をしている。

今回はホストの設定は省略。

### `vite.config.ts`

```diff
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import laravel from 'laravel-vite-plugin';
import { defineConfig, loadEnv } from 'vite';

export default({ mode }) => {
    process.env = {...process.env, ...loadEnv(mode, process.cwd(), '')};

    return defineConfig({
        server: {
            host: true,
            port: 50173,
            hmr: {
-               host: 'localhost',
+               host: 'env-sample.nazki0325.net',
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

### `.env`

```diff
APP_NAME=Laravel
APP_ENV=local
APP_KEY=
APP_DEBUG=true
- APP_URL=http://localhost:50000
+ APP_URL=http://env-sample.nazki0325.net

(以下略)
```

## 証明書を作成

ここでは `mkcert` を使用。
サブドメインも運用できるようワイルドカードを指定する。

```
PS C:\Users\nazki\laravel-docker-vite> mkcert env-sample.nazki0325.net "*.env-sample.nazki0325.net"
```

## pem ファイルの設置

生成された pem ファイルを `docker/ssl/` 以下に設置。
ホストにリバースプロキシを設置している場合は、そちらも各自で追加。

### `docker-compose.yml`

```diff
(略)

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

(略)
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
                host: 'env-sample.nazki0325.net',
            },
+           https: {
+               key: fs.readFileSync(`/ssl/env-sample.nazki0325.net+1-key.pem`),
+               cert: fs.readFileSync(`/ssl/env-sample.nazki0325.net+1.pem`),
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
- APP_URL=http://env-sample.nazki0325.net
+ APP_HOST=env-sample.nazki0325.net
+ APP_URL=https://env-sample.nazki0325.net

(略)
```

## `npm run build` 時の対応

以下の設定をしないと、ブラウザで **「HTTPS のページなのに HTTP が使われている」** 的なエラーが出る

```diff
# vite 設定
+ ASSET_URL=https://env-sample.nazki0325.net

APP_NAME=Laravel
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_HOST=env-sample.nazki0325.net
APP_URL=https://env-sample.nazki0325.net

(略)
```

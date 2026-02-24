# サブドメイン運用

## ルート設定

* `v1.env-sample.nazki0325.net`
* `v2.env-sample.nazki0325.net`

の2つのサブドメインを作成し、`env-sample.nazki0325.net` 本体とは別の表示をする

### app/routes/web.php

```
<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::domain('env-sample.nazki0325.net')->group(function () {
    Route::get('/', function () {
        return Inertia::render('Welcome');
    })->name('home');
});

Route::domain('v1.env-sample.nazki0325.net')->group(function () {
    Route::get('/', function () {
        return Inertia::render('Welcome-v1');
    });
});

Route::domain('v2.env-sample.nazki0325.net')->group(function () {
    Route::get('/', function () {
        return Inertia::render('Welcome-v2');
    });
});
```

* `resources/js/pages/Welcome-v1.vue`
* `resources/js/pages/Welcome-v2.vue`

を作成し、表示内容を変えておく

## vite の設定 (npm run dev 時)

vite は `https://env-sample.nazki0325.net:50173` で動いているので、アクセスできるサブドメインを設定して CORS エラーを回避する

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
            port: 50173,
+           cors: {
+               origin: [
+                   'https://env-sample.nazki0325.net',
+                   'https://v1.env-sample.nazki0325.net',
+                   'https://v2.env-sample.nazki0325.net'
+               ],
+               credentials: true,
+           },
            hmr: {
+               protocol: 'wss',
                host: 'env-sample.nazki0325.net',
            },
            https: {
                key: fs.readFileSync(`/ssl/env-sample.nazki0325.net+1-key.pem`),
                cert: fs.readFileSync(`/ssl/env-sample.nazki0325.net+1.pem`),
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

## ホストマシンの設定 (npm run build 時)

ビルドファイルは `https://env-sample.nazki0325.net/build/assets/` に設置されるので、アクセスできるサブドメインを設定して CORS エラーを回避する
ここでは nginx リバースプロキシを設定する

```diff
# app
server {
    listen 80;
    server_name env-sample.nazki0325.net;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl http2;
    server_name env-sample.nazki0325.net;

    include C:/nginx-1.24.0/conf.d/common/proxy-common.conf;
    include C:/nginx-1.24.0/conf.d/common/ssl.net.nazki0325.env-sample.conf;

    location / {
        proxy_pass http://192.168.0.202:50000;

        proxy_set_header Host               env-sample.nazki0325.net;
        proxy_set_header X-Forwarded-Proto  https;
        proxy_set_header X-Forwarded-Port   443;
    }

+   # npm run build 環境下で CORS エラーが出るのを対策
+   location /build/assets/ {
+       proxy_pass http://192.168.0.202:50000;
+
+       set $cors_origin "";
+       if ($http_origin ~* "^https?://(v1|v2)\.env-sample\.nazki0325\.net$") {
+           set $cors_origin $http_origin;
+       }
+
+       add_header 'Access-Control-Allow-Origin' $cors_origin always;
+       add_header 'Access-Control-Allow-Credentials' 'true' always;
+       add_header 'Access-Control-Allow-Methods' 'GET,POST,OPTIONS' always;
+       add_header 'Access-Control-Allow-Headers' 'Authorization,Content-Type' always;
+       add_header 'Cache-Control' 'no-store, no-cache, must-revalidate, proxy-revalidate' always;
+
+       if ($request_method = 'OPTIONS') {
+           add_header 'Content-Length' 0;
+           return 204;
+       }
+   }
}

# サブドメイン 1
server {
    listen 80;
    server_name v1.env-sample.nazki0325.net;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl http2;
    server_name v1.env-sample.nazki0325.net;

    include C:/nginx-1.24.0/conf.d/common/proxy-common.conf;
    include C:/nginx-1.24.0/conf.d/common/ssl.net.nazki0325.env-sample.conf;

    location / {
        proxy_pass http://192.168.0.202:50000;

        proxy_set_header Host               env-sample.local.nazki0325.net;
        proxy_set_header X-Forwarded-Proto  https;
        proxy_set_header X-Forwarded-Port   443;
    }
}

# サブドメイン 2
server {
    listen 80;
    server_name v2.env-sample.nazki0325.net;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl http2;
    server_name v2.env-sample.nazki0325.net;

    include C:/nginx-1.24.0/conf.d/common/proxy-common.conf;
    include C:/nginx-1.24.0/conf.d/common/ssl.net.nazki0325.env-sample.conf;

    location / {
        proxy_pass http://192.168.0.202:50000;

        proxy_set_header Host               v2.env-sample.nazki0325.net;
        proxy_set_header X-Forwarded-Proto  https;
        proxy_set_header X-Forwarded-Port   443;
    }
}
```

## 静的ファイルだけのサブドメイン

`static.env-sample.nazki0325.net` で `static` 以下のファイルを見れるようにする。
ホストマシンの設定は `env-sample.nazki0325.net` と同じポートへの転送だけ。

### static/index.html

中身は静的ファイルなら何でもいい

### docker/nginx/default.conf

```diff
(略)

+ server {
+   listen 80;
+   server_name static.env-sample.nazki0325.net;
+
+   root /src/static;
+   index index.html;
}
```

### docker-compose.yml

```diff
(略)

services:
    nginx:
        build:
            context: ./docker/nginx
        depends_on:
            - fpm
        ports:
            - 50000:80
        volumes:
            - ./public:/src/public
+           - ./static:/src/static
            - ./docker/nginx/logs:/logs
            
(略)
```

# mariadb のセットアップ

Laravel は何らかのデータベースサーバが動作に必要なため、ここでセットアップ。
この手順が必要ないフレームワークもあるかもしれない。

## コンテナの追加

### `docker-compose.yml`

```diff
volumes:
    vendor:
    node_modules:

services:
    app:
        build:
            context: ./docker/app
+       depends_on:
+           - mariadb
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
+       depends_on:
+           - mariadb
        volumes:
            - .:/src
            - node_modules:/src/node_modules
            - vendor:/src/vendor
+   mariadb:
+       image: mariadb:latest
+       volumes:
+           - ./docker/mariadb/data:/var/lib/mysql
+       environment:
+           MYSQL_DATABASE: ${DB_DATABASE}
+           MYSQL_USER: ${DB_USERNAME}
+           MYSQL_PASSWORD: ${DB_PASSWORD}
+           MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
```

### `docker/app/Dockerfile`

```diff
FROM php:8.4-cli

RUN apt-get update
RUN apt-get install -y git zip unzip

+ # mysql
+ RUN docker-php-ext-install pdo_mysql mysqli

# composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV PATH="/root/.composer/vendor/bin:${PATH}"

WORKDIR /src
ENTRYPOINT [ "bash", "-c", "tail -f /dev/null" ]
```

### `.env`

```diff
(略)

- DB_CONNECTION=sqlite
+ DB_CONNECTION=mysql
+ DB_HOST=mariadb
+ DB_PORT=3306
+ DB_DATABASE=laravel
+ DB_USERNAME=user
+ DB_PASSWORD=pass
+ DB_ROOT_PASSWORD=any_root_password

(略)
```

## マイグレーション実行

```
PS C:\Users\nazki\laravel-docker-vite> docker compose exec app php artisan migrate
```

ここまでうまく作業が進めば、ブラウザアクセスは Vite 関連のエラーで止まるはず

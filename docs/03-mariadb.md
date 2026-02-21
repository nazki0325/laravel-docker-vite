# mariadb のセットアップ

## `docker-compose.yml`

```diff
volumes:
    vendor:
    node_modules:

services:
    cli:
        build:
            context: ./docker/cli
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

## `docker/cli/Dockerfile`

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

## `.env`

```diff
APP_NAME=Laravel
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file
# APP_MAINTENANCE_STORE=database

# PHP_CLI_SERVER_WORKERS=4

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

- DB_CONNECTION=sqlite
+ DB_CONNECTION=mysql
+ DB_HOST=mariadb
+ DB_PORT=3306
+ DB_DATABASE=laravel
+ DB_USERNAME=user
+ DB_PASSWORD=pass
+ DB_ROOT_PASSWORD=any_root_password

(以下略)
```

## マイグレーション実行

```
PS C:\Users\nazki\laravel-docker-vite> docker compose exec cli php artisan migrate
```

ここまでうまく作業が進めば、ブラウザアクセスは Vite 関連のエラーで止まるはず

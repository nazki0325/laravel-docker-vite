# nginx と php-fpm の追加

## コンテナの追加

### `docker-compose.yml`

```diff
volumes:
    vendor:
    node_modules:

services:
    cli:
        build:
            context: ./docker/cli
        volumes:
            - .:/src
            - node_modules:/src/node_modules
            - vendor:/src/vendor
+   nginx:
+       build:
+           context: ./docker/nginx
+       depends_on:
+           - fpm
+       ports:
+           - 50000:80
+       volumes:
+           - .:/src
+           - ./docker/nginx/logs:/logs
+   fpm:
+       build:
+           context: ./docker/fpm
+       volumes:
+           - .:/src
+           - node_modules:/src/node_modules
+           - vendor:/src/vendor
+           - ./docker/fpm/php.ini:/usr/local/etc/php/php.ini
```

### `docker/fpm/Dockerfile`

```diff
+ FROM php:8.4-fpm
+
+ RUN apt-get update \
+   && apt-get install -y \
+   git \
+   zip \
+   unzip \
+   libmcrypt-dev \
+   libzip-dev
+
+ RUN docker-php-ext-install zip
+ RUN docker-php-ext-install bcmath
+ RUN docker-php-ext-install pdo_mysql mysqli exif
+
+ WORKDIR /src
+ ENTRYPOINT [ "bash", "-c", "exec php-fpm" ]
```

### `docker/nginx/Dockerfile`

```diff
+ FROM nginx:1.29
+ COPY ./default.conf /etc/nginx/conf.d/default.conf
```

### `docker/nginx/default.conf`

```diff
+ server {
+   listen 80;
+   server_name _;
+
+   client_max_body_size 1G;
+
+   root /src/public;
+   index index.php;
+
+   access_log /logs/access.log;
+   error_log  /logs/error.log;
+
+   location / {
+       try_files $uri $uri/ /index.php$is_args$args;
+   }
+
+   location ~ \.php$ {
+       fastcgi_split_path_info ^(.+\.php)(/.+)$;
+       fastcgi_pass fpm:9000;
+       fastcgi_index index.php;
+       include fastcgi_params;
+       fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
+       fastcgi_param PATH_INFO $fastcgi_path_info;

+       fastcgi_param HTTP_X_FORWARDED_HOST $host;
+       fastcgi_param HTTP_X_FORWARDED_PROTO $http_x_forwarded_proto;
+       fastcgi_param HTTP_X_FORWARDED_PORT $http_x_forwarded_port;
+       fastcgi_param HTTP_X_FORWARDED_FOR $proxy_add_x_forwarded_for;
+    }
+}
```

## (Laravel の場合) 権限の変更

```
PS C:\Users\nazki\laravel-docker-vite> docker compose up -d --build
PS C:\Users\nazki\laravel-docker-vite> docker compose exec fpm bash
root@4e08a6adf52f:/src#
root@4e08a6adf52f:/src# chmod -R 0777 storage bootstrap/cache
```

ここまでうまく作業が進めば、ブラウザアクセスはデータベース関連のエラーで止まるはず

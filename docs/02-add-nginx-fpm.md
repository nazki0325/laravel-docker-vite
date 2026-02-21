# nginx と php-fpm の追加

## `docker-compose.yml`

```diff
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

```
PS C:\Users\nazki\laravel-docker-vite> docker compose up -d --build
```



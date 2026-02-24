# コンテナ自体が別のサブドメインの例

## phpMyAdmin の追加

`my.env-sample.nazki0325.net` でアクセスできるようにする。
コンテナはポート `50001` を使用。

### ホストマシンの設定

```diff
(略)

server {
    listen 80;
+   server_name my.env-sample.nazki0325.net;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl http2;
+   server_name my.env-sample.nazki0325.net;

    include C:/nginx-1.24.0/conf.d/common/proxy-common.conf;
    include C:/nginx-1.24.0/conf.d/common/ssl.net.nazki0325.env-sample.conf;

    location / {
+       proxy_pass http://192.168.0.202:50001;
    }
}
```

### `docker-compose.yml`

```diff
(略)

+   phpmyadmin:
+       image: phpmyadmin/phpmyadmin
+       depends_on:
+           - mariadb
+       restart: always
+       environment:
+           PMA_HOST: mariadb
+           PMA_USER: root
+           PMA_PASSWORD: ${DB_ROOT_PASSWORD}
+       ports:
+           - 50001:80"
+       volumes:
+           - ./docker/phpmyadmin/sessions:/sessions
```

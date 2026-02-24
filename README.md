# laravel-docker-vite

`docker compose` + `Vite` の環境構築サンプルです。

デモとして以下の環境を採用しています。

* Laravel 12
* Inertia
* Vue.js

## 全体像

以下のサブドメインを実装しています。

### `env-sample.nazki0325.net`
中核となるドメイン。

### `v1.env-sample.nazki0325.net`, `v2.env-sample.nazki0325.net` 
PHP + Vite が動作するサブドメイン。`npm run dev` と `npm run build` の双方に対応。

### `static.env-sample.nazki0325.net`
静的ファイルだけのサブドメイン。

### `my.env-sample.nazki0325.net`
別コンテナの web サーバで動作するサブドメイン。

## Docker コンテナの構造

```mermaid
flowchart TD
    ホストのリバースプロキシ --> phpmyadmin:50001
    ホストのリバースプロキシ --> nginx:50000 --> fpm:9000 --> npm --> vite:50173
    docker-compose --> cli --> mariadb:3306
    cli --> composer
    phpmyadmin:50001 --> mariadb:3306
    fpm:9000 --> mariadb:3306

    composer --> ファイルシステム
    npm --> ファイルシステム
```

## 構築手順

1. [Docker の最低限のセットアップ](docs/01-initial-setup.md)
    : フレームワークが最低限動作するように構築
1. [nginx と fpm の設定](docs/02-nginx-fpm.md)
    : ブラウザでのアクセスを整える
1. [mariadb の設定](docs/03-mariadb.md)
    : 必要に応じて DB サーバを作成
1. [Vite の設定](docs/04-vite.md)
    : Vite の環境構築
1. [SSL の設定](docs/05-ssl.md)
    : Vite 環境を https 化
1. [サブドメインの設定](docs/06-subdomains.md)
    : サブドメインでアクセスできるようにする
1. [phpMyAdmin の設定](docs/07-phpmyadmin.md)
    : 別コンテナで動作するサーバを追加
1. [その他、細かい調整](docs/08-env.md)

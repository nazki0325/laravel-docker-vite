# 最小構成の Docker Compose 環境に Laravel をインストール

想定 : **PHP 8.4** で **Laravel 12** を動作させる

## 最低限の Docker Compose

### `docker-compose.yml`

```diff
+ services:
+   cli:
+       build:
+           context: ./docker/cli
+       volumes:
+           - .:/src
```

### `docker/cli/Dockerfile`

今後出てくる共有ボリュームの都合で、常駐コンテナにする (`docker compose run` は使わない)

```diff
+ FROM php:8.4-cli
+
+ RUN apt-get update
+ RUN apt-get install -y git zip unzip
+
+ # composer
+ COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
+ ENV PATH="/root/.composer/vendor/bin:${PATH}"
+
+ WORKDIR /src
+ ENTRYPOINT [ "bash", "-c", "tail -f /dev/null" ]
```

## Docker Compose 立ち上げ

```
PS C:\Users\nazki\laravel-docker-vite> docker compose up -d --build
PS C:\Users\nazki\laravel-docker-vite> docker compose run cli bash 
root@7f55adb2f897:/src#
root@7f55adb2f897:/src# composer init

(ダミーなので選択肢はなんでもいい)
```

出来上がる `composer.json` の例

```diff
+ {
+   "name": "root/src",
+   "require": {}
+ }
```

## Laravel インストール

仮のディレクトリ `my-app` に Laravel Installer 経由でセットアップ

```
root@7f55adb2f897:/src# composer require laravel/installer
root@7f55adb2f897:/src# ./vendor/bin/laravel new my-app
```

Laravel インストールコマンドが走り出すので、プロジェクトに合わせた選択肢を選ぶ。
ここでは Vue, No authentication, PHPUnit, AI なしを選択、`npm install` もしなくていい。

ちなみに、Laravel 12 ではデフォルトのデータベースに sqlite が採用されている。後述のセクションで mariadb を設置する。

## 仮ディレクトリにインストールした Laravel をプロジェクトディレクトリに移動

Laravel インストール用に作った `composer.json` は削除して構わない。

```
root@7f55adb2f897:/src# rm composer.*
root@7f55adb2f897:/src# rm vendor -rf
```

プロジェクトディレクトリに移動

```
root@7f55adb2f897:/src# mv my-app/* ./
root@7f55adb2f897:/src# mv my-app/.* ./
root@7f55adb2f897:/src# rm my-app -rf
```

Laravel インストーラが生成した `.gitignore` を整備しておく。
環境構築という意味では Laravel 本体は本質ではないので、合わせて除外設定。

**`resources` に関しては tailwind 関連で関わってくるので除外しない**

### `.gitignore`

```diff
/.phpunit.cache
/bootstrap/ssr
/node_modules
/public/build
/public/hot
/public/storage
/resources/js/actions
/resources/js/routes
/resources/js/wayfinder
/storage/*.key
/storage/pail
/vendor
.env
.env.backup
.env.production
.phpactor.json
.phpunit.result.cache
Homestead.json
Homestead.yaml
npm-debug.log
yarn-error.log
/auth.json
/.fleet
+ /.github
/.idea
/.nova
/.vscode
/.zed

+ # 今回のプロジェクトで本質でないファイルを一括除外
+ /artisan
+ /app
+ /bootstrap
+ /config
+ /database
+ /public
+ /routes
+ /storage
+ /tests
+ /phpunit.xml
+ eslint.config.js
+ pint.json
+ tsconfig.json
```

## composer install

大量にファイルが生成される `vendor`, `node_modules` をホストからマウントしないよう `docker-compose.yml` を修正

**開発時にエディタが依存関係を解決できなくなるので、必要に応じてマウントし直す手順が必要になる可能性がある**

### `docker-compose.yml`

```diff
+ volumes:
+   vendor:
+   node_modules:
+
services:
    cli:
        build:
            context: ./docker/cli
        volumes:
            - .:/src
+           - node_modules:/src/node_modules
+           - vendor:/src/vendor
```

```
PS C:\Users\nazki\laravel-docker-vite> docker compose up -d --build
PS C:\Users\nazki\laravel-docker-vite> docker compose exec cli bash
root@18c6f805417d:/src#
root@18c6f805417d:/src# composer install
```

`cli` コンテナに `node` はインストールしていないので、`npm install` はしない。
後述の `fpm` コンテナで行なう。

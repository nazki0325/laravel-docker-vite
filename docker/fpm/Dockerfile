FROM php:8.4-fpm

RUN apt-get update \
    && apt-get install -y \
    git \
    zip \
    unzip \
    libmcrypt-dev \
    libzip-dev

RUN docker-php-ext-install zip
RUN docker-php-ext-install bcmath
RUN docker-php-ext-install pdo_mysql mysqli exif

WORKDIR /src
ENTRYPOINT [ "bash", "-c", "exec php-fpm" ]

FROM php:8.4-cli

RUN apt-get update
RUN apt-get install -y git zip unzip

# mysql
RUN docker-php-ext-install pdo_mysql mysqli

# composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV PATH="/root/.composer/vendor/bin:${PATH}"

WORKDIR /src
ENTRYPOINT [ "bash", "-c", "tail -f /dev/null" ]

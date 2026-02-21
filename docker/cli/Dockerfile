FROM php:8.4-cli

RUN apt-get update
RUN apt-get install -y git zip unzip

# composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV PATH="/root/.composer/vendor/bin:${PATH}"

WORKDIR /src

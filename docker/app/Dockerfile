ARG PHP_VER=8.4
FROM php:${PHP_VER}-cli

EXPOSE ${VITE_PORT}

RUN apt-get update
RUN apt-get install -y git zip unzip

# mysql
RUN docker-php-ext-install pdo_mysql mysqli

# composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV PATH="/root/.composer/vendor/bin:${PATH}"

# node
ENV NODE_VERSION=20.19.0
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version

#RUN npm install

WORKDIR /src
ENTRYPOINT [ "bash", "-c", "tail -f /dev/null" ]


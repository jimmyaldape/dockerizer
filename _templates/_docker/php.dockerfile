FROM php:7.3-fpm-alpine

ADD ./docker/php/www.conf /usr/local/etc/php-fpm.d/www.conf

RUN addgroup -g 1000 laravel && adduser -G laravel -g laravel -s /bin/sh -D laravel

RUN mkdir -p /var/www/html

RUN chown laravel:laravel /var/www/html

WORKDIR /var/www/html

RUN apk add --update --no-cache bash libpng-dev gcc make musl-dev freetype libjpeg-turbo freetype-dev libjpeg-turbo-dev libzip-dev libxml2

RUN docker-php-ext-configure gd \
    --with-gd \
    --with-freetype-dir=/usr/include/ \
    --with-png-dir=/usr/include/ \
    --with-jpeg-dir=/usr/include/ && \
  NPROC=$(grep -c ^processor /proc/cpuinfo 2>/dev/null || 1) && \
  docker-php-ext-install -j${NPROC} gd

RUN docker-php-ext-install pdo_mysql bcmath zip

# Install Laravel Envoy
#RUN composer global require "laravel/envoy"

# Install PHP_CodeSniffer
#RUN composer global require "squizlabs/php_codesniffer=*"

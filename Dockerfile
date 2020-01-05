FROM node:12.10.0-alpine

ENV LANG=ja_JP.UTF-8

# パッケージupdate & sudoインストール
RUN apk update \
    && apk upgrade \
    && apk add --update --no-cache sudo \
    less \
    curl \
    git \ 
    && rm -rf /var/cache/apk/*

RUN mkdir -p /extension /opt
WORKDIR /extension
ADD ./docker/init.sh /opt

ENTRYPOINT ["/opt/init.sh"]

## node:latest Version
FROM node:latest AS build-stage

## Define working directory
WORKDIR /app

COPY package.json pnpm-lock.yaml ./

## Set up npm (latest version to ensure compatibility with pnpm)
RUN npm install -g npm@latest

## Set up pnpm

RUN npm install -g pnpm

## Install dependencies
RUN pnpm install

COPY ./ .

RUN pnpm run build

FROM nginx AS production-stage

RUN mkdir -p /app

WORKDIR /app

COPY --from=build-stage /app/dist /app
COPY .docker/nginx.conf /etc/nginx/nginx.conf

## Expose port 80 to the outside world
EXPOSE 80

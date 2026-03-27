## node:latest Version (build-stage)
FROM node AS build-stage

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

# Production stage
FROM nginx AS production-stage

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build-stage /app/dist /usr/share/nginx/html

COPY .docker/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

# Start nginx server
CMD ["nginx", "-g", "daemon off;"]

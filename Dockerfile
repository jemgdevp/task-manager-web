FROM node:22-alpine AS build-stage

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN set -eu; \
	for attempt in 1 2 3 4 5; do \
		pnpm install --frozen-lockfile && break; \
		echo "pnpm install failed (attempt ${attempt}/5). Retrying..."; \
		if [ "$attempt" -eq 5 ]; then exit 1; fi; \
		sleep $((attempt * 5)); \
	done

COPY . .

RUN pnpm build

FROM nginx:1.27-alpine AS production-stage

WORKDIR /app

COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

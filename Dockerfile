FROM node:22-alpine AS build-stage

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV PNPM_VERSION="10.12.4"

RUN corepack enable && \
		set -eu; \
		for registry in https://registry.npmmirror.com https://registry.npmjs.org; do \
			echo "Preparing pnpm from ${registry}"; \
			COREPACK_NPM_REGISTRY="${registry}" corepack prepare "pnpm@${PNPM_VERSION}" --activate && break; \
			echo "corepack prepare failed for ${registry}"; \
		done && \
		pnpm --version

COPY package.json pnpm-lock.yaml ./

RUN set -eu; \
		for registry in https://registry.npmmirror.com https://registry.npmjs.org; do \
			echo "Installing dependencies from ${registry}"; \
			pnpm config set registry "${registry}"; \
			for attempt in 1 2 3 4 5; do \
				pnpm install --frozen-lockfile && exit 0; \
				echo "pnpm install failed on ${registry} (attempt ${attempt}/5). Retrying..."; \
				if [ "$attempt" -eq 5 ]; then break; fi; \
				sleep $((attempt * 5)); \
			done; \
		done; \
		exit 1

COPY . .

RUN pnpm build

FROM nginx:1.27-alpine AS production-stage

WORKDIR /app

COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

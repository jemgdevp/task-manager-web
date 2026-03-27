FROM node:22-alpine AS build-stage

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV PNPM_VERSION="10.12.4"

# Mitigation for unstable DNS resolvers in some Dokploy hosts.
RUN printf "nameserver 1.1.1.1\nnameserver 8.8.8.8\n" > /etc/resolv.conf || true

RUN corepack enable

RUN set -eu; \
		prepared=0; \
		for registry in https://registry.npmmirror.com https://registry.yarnpkg.com https://registry.npmjs.org; do \
			echo "Preparing pnpm from ${registry}"; \
			if COREPACK_NPM_REGISTRY="${registry}" corepack prepare "pnpm@${PNPM_VERSION}" --activate; then \
				prepared=1; \
				break; \
			fi; \
			echo "corepack prepare failed for ${registry}"; \
		done; \
		if [ "$prepared" -ne 1 ]; then \
			echo "Could not activate pnpm. Check DNS/network on host."; \
			exit 1; \
		fi; \
		pnpm --version

COPY package.json pnpm-lock.yaml ./

RUN set -eu; \
		installed=0; \
		for registry in https://registry.npmmirror.com https://registry.yarnpkg.com https://registry.npmjs.org; do \
			echo "Installing dependencies from ${registry}"; \
			pnpm config set registry "${registry}"; \
			for attempt in 1 2 3 4 5; do \
				if pnpm install --frozen-lockfile; then \
					installed=1; \
					break 2; \
				fi; \
				echo "pnpm install failed on ${registry} (attempt ${attempt}/5). Retrying..."; \
				if [ "$attempt" -eq 5 ]; then \
					break; \
				fi; \
				sleep $((attempt * 5)); \
			done; \
		done; \
		if [ "$installed" -ne 1 ]; then \
			echo "Dependency installation failed on all registries. Check DNS/network on host."; \
			exit 1; \
		fi

COPY . .

RUN pnpm run build

FROM nginx:1.27-alpine AS production-stage

WORKDIR /app

COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# TaskManager WEB Vue 3
This is the web frontend for TaskManager, built with Vue 3 and Vite. It provides a user interface for managing tasks, projects, and teams.

## Local setup

### Requirements
- Node.js >= 22
- pnpm >= 10
- Laravel API running (default: `http://localhost:8000`)
- Laravel Reverb server running (default: `ws://localhost:8080`)

### Install and run
1. Install dependencies:
	- `pnpm install`
2. Start development server:
	- `pnpm dev`

### Build
- `pnpm build`

### Tests
- `pnpm test -- --run`

## Environment variables

Example `.env` values:

```env
VITE_API_URL=http://localhost:8000
VITE_REVERB_APP_KEY=your-reverb-app-key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

## Auth and API flow

- Login: `POST /api/login`
- Register: `POST /api/register`
- Logout: `POST /api/logout`
- Tasks CRUD: `/api/tasks`

The frontend uses a shared Axios client with:
- Bearer token persistence (`localStorage`)
- Request interceptor (auto `Authorization` header)
- Normalized API errors for UI feedback

## Reverb / Echo notes

Frontend boots Echo at app startup and attempts channel subscription for task events.

Expected backend pieces:
- Broadcasting auth endpoint: `POST /api/broadcasting/auth`
- Broadcasted events for task updates (`TaskCreated`, `TaskUpdated`, `TaskDeleted`)
- Channels configured for:
  - public channel `tasks`
  - private channel `user.{id}.tasks`

If events are not emitted yet in backend, CRUD still works via API calls.

## Docs and API Reference
- [API Reference](https://api.taskmanager.jemg.dev/api/docs)

## License

This software framework is open-sourced software licensed under the [MIT license](LICENSE).

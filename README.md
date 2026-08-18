## File Uploader (Vue 3 + Node/Express)

Simple file uploader with a Vue 3 frontend and a Node.js/Express backend.

### Quick start (recommended)

Using the root scripts to install dependencies and run both servers together:

```
# from project root
npm run setup   # installs deps in server/ and front_end/
npm run dev     # starts API (server/) and Vue dev server (front_end/) concurrently
```

- Frontend: http://localhost:8080
- API: http://localhost:3000

Ensure `front_end/.env` points to your API and `server/.env` has `DEV_HOST` set to your frontend origin (see Env vars below).

### Features
- **Drag & drop uploads** with multiple file support
- **Progress bar** during upload
- **Image thumbnails** preview
- **Video playback** with chunked streaming (HTTP Range) via Video.js
- **Bootstrap gallery** for images and videos
- **Static file hosting** for uploaded images and other files
- **Daily-rotated access logs** under `server/logs`

### Project structure
```
file-uploader/
  front_end/     # Vue 3 SPA (build outputs to server/public)
  server/        # Express server (serves API, uploads and built SPA)
```

### Requirements
- Node.js 14+ (recommended)
- npm 6+

### Root scripts

From the project root you can orchestrate both apps:

- `npm run setup` – install dependencies in `server/` and `front_end/`
- `npm run dev` – run API and Vue dev server concurrently
- `npm run build` – build the SPA into `server/public`
- `npm run start` – start the API server (after building)

There is also a convenience script that builds the frontend and starts the server:

```
./scripts/run.sh
```

### Environment variables

Copy the example files and edit as needed:

```
cp server/.env.example server/.env
cp front_end/.env.example front_end/.env
```

**`server/.env`**

```
# Port for the API / production app server
PORT=3000

# Allowed origin for dev CORS (Vue dev server URL)
DEV_HOST=http://localhost:8080
```

**`front_end/.env`**

```
# Base URL of the API server
VUE_APP_API_URL=http://localhost:3000

# Client log backend: console (default), sentry, or rollbar
VUE_APP_LOG_SERVICE=console
```

### Run in development
Option A – use root scripts (single terminal):

```
npm run setup
npm run dev
```

Option B – run separately:

Run the API (Terminal A):
```
cd server
npm install
node index.js
```

Run the frontend (Terminal B):
```
cd front_end
npm install
npm run serve
```

- Frontend: http://localhost:8080
- API: http://localhost:3000

Ensure `front_end/.env` points to your API and `server/.env` has `DEV_HOST` set to your frontend origin.

### Build for production
Build the SPA into `server/public`, then start the server which will serve the built assets and the API.

Option A – use root scripts:
```
npm run build
npm run start
```

Option B – run commands manually:
```
cd front_end
npm install
npm run build

cd ../server
npm install
node index.js
```

Open `http://localhost:3000` to use the app.

### API

- **POST** `/upload-files`
  - Content-Type: `multipart/form-data`
  - Field name: `files` (multiple allowed)
  - Response: Array of uploaded file metadata (e.g., `filename`, `size`, `path`, `mimetype`)

- **GET** `/uploads/video/:name`
  - Requires `Range` header
  - Streams video in chunks (HTTP 206)

- **Static files**
  - Images: `/uploads/img/:filename`
  - Misc: `/uploads/misc/:filename`

### Limits and types
- Max file size: **100 MB** per file (configured in server via Multer)
- Images and videos are detected by MIME type and routed to `uploads/img` or `uploads/video`. Other files go to `uploads/misc`.

### Logging

**Server:** Access logs are written daily-rotated to `server/logs/access.log`.

**Frontend:** Vue components use a shared logger at `front_end/src/utils/logger.ts` instead of calling `console.*` directly. Import it as:

```js
import { logger } from "@/utils/logger";

logger.warn("Something went wrong", error);
```

#### Current behavior

- **Default:** `console` — logs go to the browser devtools console (`console.debug`, `console.info`, `console.warn`, `console.error`).
- **Configuration:** Set `VUE_APP_LOG_SERVICE` (or `VITE_LOG_SERVICE`) in `front_end/.env` to one of:
  - `console` — default; no extra setup
  - `sentry` — route logs to Sentry when the SDK is initialized
  - `rollbar` — route logs to Rollbar when the SDK is initialized
- **Safe fallback:** If `sentry` or `rollbar` is selected but the SDK is not initialized on `window`, the logger falls back to `console` so local dev never breaks.
- **No SDK bundled today:** Sentry and Rollbar are not npm dependencies yet. The logger only calls them when you install and wire up an SDK yourself.

#### Adding Sentry later

1. Install the SDK, e.g. `@sentry/vue` (or `@sentry/browser`).
2. Initialize it early in `front_end/src/main.ts` before mounting the app.
3. Expose the client on `window` so the logger can find it:

   ```ts
   import * as Sentry from "@sentry/vue";

   Sentry.init({ dsn: "YOUR_DSN", /* ... */ });
   window.Sentry = Sentry;
   ```

4. Set `VUE_APP_LOG_SERVICE=sentry` in `front_end/.env` and rebuild.

Errors passed as `Error` objects are sent with `captureException`; other messages use `captureMessage`.

#### Adding Rollbar later

1. Install the SDK, e.g. `rollbar`.
2. Initialize it in `front_end/src/main.ts`:

   ```ts
   import Rollbar from "rollbar";

   const rollbar = new Rollbar({ accessToken: "YOUR_TOKEN", /* ... */ });
   window.Rollbar = rollbar;
   ```

3. Set `VUE_APP_LOG_SERVICE=rollbar` in `front_end/.env` and rebuild.

Log levels map to Rollbar's `debug`, `info`, `warning`, and `error` methods.

### Useful scripts
Frontend (`front_end/package.json`):
- `npm run serve` – start Vue dev server
- `npm run build` – build SPA into `server/public`
- `npm run watch` – build and watch into `server/public`
- `npm run test:unit` – run unit tests
- `npm run lint` – lint and fix

Server: start with `node index.js` from the `server` folder.

### Notes
- Copy `server/.env.example` and `front_end/.env.example` to `.env` in each folder before running (see Env vars above).
- When developing locally, keep both the API and the Vue dev server running.

### License
This project is licensed under the terms of the license in `LICENSE`.

## File Uploader (Vue 3 + Node/Express)

Simple file uploader with a Vue 3 frontend and a Node.js/Express backend.

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

### Environment variables

Create a `.env` file in `server/`:

```
# Port for the API / production app server
PORT=3000

# Allowed origin for dev CORS (Vue dev server URL)
DEV_HOST=http://localhost:8080
```

Create a `.env` file in `front_end/`:

```
# Base URL of the API server
VUE_APP_API_URL=http://localhost:3000
```

### Run in development
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
Build the SPA into `server/public`, then start the server which will serve the built assets and the API:
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
Access logs are written daily-rotated to `server/logs/access.log`.

### Useful scripts
Frontend (`front_end/package.json`):
- `npm run serve` – start Vue dev server
- `npm run build` – build SPA into `server/public`
- `npm run watch` – build and watch into `server/public`
- `npm run test:unit` – run unit tests
- `npm run lint` – lint and fix

Server: start with `node index.js` from the `server` folder.

### Notes
- Ensure your `.env` files are created as shown above before running.
- When developing locally, keep both the API and the Vue dev server running.

### License
This project is licensed under the terms of the license in `LICENSE`.

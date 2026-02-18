# AR Code Manager

Upload 3D models (`.glb`), generate QR codes, and view them in Augmented Reality — all from your browser.

## 🚀 Quick Start (Docker)

```bash
git clone https://github.com/rgdi/ar-viewer-luciar-.git
cd ar-viewer-luciar-
docker compose up --build -d
```

**That's it.** Open [http://localhost](http://localhost) in your browser.

## Features

- **Upload .glb models** with progress tracking
- **AR Viewer** — tap "View in AR" on any mobile browser
- **QR Code Generator** — scan to view models in AR instantly
- **User Authentication** — JWT-based signup/login
- **Dashboard** — manage all your uploaded 3D models
- **Dark Theme** — modern responsive UI

## Architecture

| Component | Technology |
|-----------|-----------|
| Frontend | HTML5, CSS3, Vanilla JS |
| Backend | Node.js, Express |
| Database | SQLite (WAL mode) |
| AR Engine | Google model-viewer |
| Auth | JWT + bcrypt |
| Container | Docker + Docker Compose |

## Ports

| Service | URL |
|---------|-----|
| App | `http://localhost` (port 80) |
| API | `http://localhost/api` |
| Health | `http://localhost/health` |

## Data Persistence

All data (database + uploaded models) is stored in a Docker named volume `ar_data`. Your data survives container restarts and rebuilds.

```bash
# Stop without losing data
docker compose down

# Stop AND delete all data
docker compose down -v
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | `change_this_secret_in_production` | Token signing secret |
| `CORS_ORIGIN` | `*` | Allowed CORS origins |

Edit these in `compose.yaml` for production use.

## License

MIT

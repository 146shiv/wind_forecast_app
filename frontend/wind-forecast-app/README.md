# Wind Forecast Monitoring Dashboard

A full-stack **energy analytics dashboard** that compares **actual** vs **forecasted** UK national wind power generation. Built to help users intuitively assess forecast accuracy over configurable time ranges and forecast horizons.

---

## Why This Project?

- **Real-world data** — Integrates with [Elexon BMRS](https://bmrs.elexon.co.uk/) (UK electricity market data) for actual generation (FUELHH) and wind forecasts (WINDFOR).
- **Clear visual comparison** — Dual time-series chart (actual vs forecast) with configurable **forecast horizon** (0–48 hours) so you see "the latest forecast published at least X hours before each target time."
- **Production-style stack** — REST API, modular frontend, environment-based config, and no UI framework lock-in.

---

## Tech Stack

| Layer      | Technologies |
|-----------|---------------|
| **Frontend** | React 19, Vite, JavaScript (ES modules), Recharts, Axios, Day.js, CSS |
| **Backend**  | Node.js, Express 5, JavaScript (ES modules), Axios, dotenv |
| **Data**     | Elexon BMRS APIs (FUELHH, WINDFOR); optional MongoDB (Mongoose) for persistence |

---

## Features

- **Time range selection** — Start and end datetime pickers to define the analysis window.
- **Forecast horizon slider** — 0–48 hours; for each target time, the app shows the latest forecast whose `publishTime` is at least that many hours before the target.
- **Dual-line chart** — **Actual generation** (blue, solid) and **Forecast generation** (green, dashed) in MW with tooltips and legend.
- **Responsive layout** — Centered card layout that works on desktop and smaller screens.
- **API-first design** — Backend fetches from BMRS and returns merged series; frontend consumes a single chart endpoint.

---

## Project Structure

```
wind-forecast-app/
├── backend/                    # Express API
│   ├── src/
│   │   ├── controllers/        # windController.js — fetch BMRS, merge series
│   │   ├── routes/             # windRoutes.js — /api/v1/wind/*
│   │   ├── utils/              # forecastFilter.js — horizon-based forecast selection
│   │   ├── models/             # Mongoose schemas (optional persistence)
│   │   └── server.js           # App entry, CORS, env, MongoDB connect
│   ├── .env                    # PORT, FUELHH_ENDPOINT, WINDFOR_ENDPOINT [, MONGO_URI]
│   └── package.json
│
├── frontend/
│   └── wind-forecast-app/      # Vite + React SPA
│       ├── src/
│       │   ├── api/            # windApi.js — Axios client, chart fetch
│       │   ├── components/    # DatePicker, HorizonSlider, WindChart
│       │   ├── pages/         # Dashboard.jsx — state, layout, data fetch
│       │   ├── App.jsx
│       │   ├── main.jsx
│       │   └── index.css       # Global and component styles
│       ├── vite.config.js      # Dev proxy /api → backend
│       └── package.json
│
└── README.md
```

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** (or yarn/pnpm)

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd wind-forecast-app
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # or create .env (see below)
npm run dev
```

Server runs at **http://localhost:5000** (or `PORT` from `.env`).

### 3. Frontend

```bash
cd frontend/wind-forecast-app
npm install
npm run dev
```

App runs at **http://localhost:5173**. The Vite dev server proxies `/api` to the backend, so the chart loads without CORS issues.

### 4. Open the app

In the browser, go to **http://localhost:5173**. Choose a start and end time, set the forecast horizon (e.g. 4h), and view the **Actual** vs **Forecast** lines on the chart.

---

## Environment Variables

### Backend (`.env` in `backend/`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `FUELHH_ENDPOINT` | BMRS FUELHH stream URL (actual generation) |
| `WINDFOR_ENDPOINT` | BMRS WINDFOR stream URL (wind forecasts) |
| `MONGO_URI` | _(Optional)_ MongoDB connection string if using persistence |

Example:

```env
PORT=5000
FUELHH_ENDPOINT=https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream
WINDFOR_ENDPOINT=https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream
```

### Frontend

- In development, the app uses the Vite proxy (no extra env needed).
- For production, set `VITE_API_BASE_URL` to your backend URL if it's different from the same origin.

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/wind/chart?startTime=&endTime=&forecastHorizon=` | Merged actual + forecast series for the given range and horizon (hours) |
| GET | `/api/v1/wind/fetch-actual?from=&to=` | Proxy to FUELHH (WIND only); returns raw actuals |
| GET | `/api/v1/wind/fetch-forecast?from=&to=` | Proxy to WINDFOR; returns raw forecasts |

**Chart response** (array of points):

```json
[
  { "time": "2026-03-13T00:00:00.000Z", "actual": 16917, "forecast": 20245 },
  { "time": "2026-03-13T00:30:00.000Z", "actual": 16900, "forecast": null }
]
```

`forecast` is `null` when no forecast satisfies the horizon rule for that time.

---

## How the Forecast Horizon Works

For each **target time** (e.g. 18:00):

- **Limit time** = target time − *forecast horizon* (e.g. 18:00 − 4h = 14:00).
- The app selects **forecasts** with `publishTime ≤ limit time` for that target time.
- Among those, it picks the one with the **latest** `publishTime`.
- That value is shown as the **Forecast** line at the target time; if none exist, the point is omitted (no green line there).

---

## Scripts

| Location | Command | Purpose |
|----------|---------|---------|
| Backend | `npm run dev` | Start API with nodemon (watch) |
| Frontend | `npm run dev` | Start Vite dev server |
| Frontend | `npm run build` | Production build |
| Frontend | `npm run preview` | Preview production build |

---

## License

ISC (or your choice — update as needed.)

---

*Built to demonstrate full-stack JavaScript, REST API design, and integration with a real energy data API.*

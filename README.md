# Courier Settlement Reconciliation & Alert Engine

A production-style MERN stack application that simulates the reconciliation workflow used by logistics aggregators for COD settlement validation, discrepancy detection, and queue-based merchant alerts.

## Stack

- Frontend: React + Vite + CSS
- Backend: Node.js + Express
- Database: MongoDB
- Queue: BullMQ + Redis
- Scheduler: node-cron with `Asia/Kolkata` timezone

## Project Structure

```text
courier-recon/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── data/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── queues/
│   │   ├── routes/
│   │   ├── schedulers/
│   │   ├── services/
│   │   ├── utils/
│   │   └── workers/
├── frontend/
│   └── src/
├── postman/
├── docker-compose.yml
├── Dockerfile.backend
└── Dockerfile.frontend
```

## Features

- Settlement upload API for CSV or JSON payloads up to 1000 rows
- Idempotent batch ingestion using `batchId` and content hash protection
- Daily cron reconciliation at `2:00 AM IST`
- Manual reconciliation trigger
- Rules implemented:
  - COD mismatch using `2% or Rs.10` tolerance
  - Weight mismatch above `10%`
  - RTO charge on delivered orders
  - Overdue settlement after `14 days`
  - Duplicate settlement detection
- Queue-based discrepancy events published by reconciliation
- Separate notification worker sends webhook payloads
- React dashboard with upload, filters, logs, and discrepancy inspection

## Environment Variables

Copy `.env.example` to `.env`.

```bash
NODE_ENV=development
PORT=5050
MONGODB_URI=mongodb://localhost:27017/courier_recon
REDIS_URL=redis://127.0.0.1:6379
NOTIFICATION_WEBHOOK_URL=https://webhook.site/your-id
FRONTEND_URL=http://localhost:5173
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Start MongoDB and Redis locally.

3. Seed sample data:

```bash
npm run seed
```

4. Start the API:

```bash
npm run dev:backend
```

5. Start the worker in another terminal:

```bash
cd backend
npm run worker
```

6. Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Or from the repo root:

```bash
npm run dev:frontend
```

## Docker Setup

1. Create `.env` from `.env.example`.
2. Run:

```bash
docker compose up --build
```

3. Seed demo data after containers are up:

```bash
docker compose exec backend npm run seed
```

Services:

- Frontend: `http://localhost:5173`
- MongoDB: `mongodb://localhost:27017`
- Redis: internal to Docker network

Docker notes:

- The frontend is exposed on `http://localhost:5173`
- The backend is not exposed to the host in Docker mode because `5050` was already in use locally during verification
- The frontend proxies `/api` requests internally to the `backend` service
- MongoDB and Redis use Docker service names internally:
  - `mongodb://mongodb:27017/courier_recon`
  - `redis://redis:6379`

Useful Docker commands:

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f
docker compose down
docker compose down -v
```

## Render Deployment

This repo includes `render.yaml` for a Render Blueprint deployment.

Recommended hosted services:

- MongoDB: MongoDB Atlas
- Redis: Render Key Value from the Blueprint
- Backend API: Render Web Service
- Worker: Render Background Worker
- Frontend: Render Static Site

Steps:

1. Push this repo to GitHub.
2. Create a MongoDB Atlas cluster.
3. Copy your Atlas connection string, for example:

```bash
mongodb+srv://<username>:<password>@<cluster-url>/courier_recon?retryWrites=true&w=majority
```

4. In Render, create a new Blueprint from this GitHub repo.
5. Render will ask for synced secret values from `render.yaml`.
6. Set these values:

```bash
MONGODB_URI=<your MongoDB Atlas connection string>
NOTIFICATION_WEBHOOK_URL=<your webhook.site or mock endpoint URL>
FRONTEND_URL=https://<your-frontend-service>.onrender.com
VITE_API_BASE_URL=https://<your-backend-service>.onrender.com/api
```

7. After the backend deploys, update frontend environment variable `VITE_API_BASE_URL` if the generated backend URL differs from your expected URL.
8. Redeploy the frontend static site after updating `VITE_API_BASE_URL`.

Deployment notes:

- The backend listens on Render's assigned `PORT`.
- `FRONTEND_URL` supports comma-separated origins, for example:

```bash
https://your-frontend.onrender.com,http://localhost:5173
```

- The worker runs separately using:

```bash
cd backend && npm run worker
```

- Seed production/demo data only if needed:

```bash
npm run seed --workspace backend
```

## Queue Setup Notes

- BullMQ queue name: `discrepancy-notifications`
- Redis is mandatory and must be reachable before backend and worker start
- Notifications are produced by reconciliation and consumed only by `backend/src/workers/notificationWorker.js`

## Cron Job

- Implemented in `backend/src/schedulers/reconciliationScheduler.js`
- Schedule expression: `0 2 * * *`
- Timezone: `Asia/Kolkata`

## Seed Data

The seed script inserts:

- Orders with matched and discrepant cases
- Settlement batches, including duplicate settlement examples
- Ready-to-run records for manual reconciliation tests

Run:

```bash
npm run seed
```

## Sample API Requests

### Health

```http
GET /api/health
```

### Upload JSON Settlements

```http
POST /api/settlements/upload
Content-Type: application/json

{
  "rows": [
    {
      "awbNumber": "AWB2001",
      "settledCodAmount": 1350,
      "chargedWeight": 1.4,
      "forwardCharge": 65,
      "rtoCharge": 0,
      "codHandlingFee": 12,
      "settlementDate": "2026-04-08",
      "batchId": "BATCH-API-001"
    }
  ]
}
```

### Upload CSV Settlements

Use multipart form-data:

- Key: `file`
- Value: `backend/src/data/sample-settlements.csv`

### Manual Reconciliation Trigger

```http
POST /api/reconciliation/run
```

### Fetch Reconciliation Results

```http
GET /api/reconciliation/results?status=DISCREPANCY&merchantId=M001&search=AWB
```

### Fetch Dashboard Snapshot

```http
GET /api/reconciliation/dashboard
```

In Docker mode, call API routes through the frontend origin:

```http
GET http://localhost:5173/api/reconciliation/dashboard
```

## Webhook Payload

```json
{
  "merchantId": "M001",
  "awbNumber": "AWB1002",
  "discrepancyType": "COD_MISMATCH",
  "expected": 900,
  "actual": 860,
  "suggestedAction": "Verify COD remittance and raise finance dispute with courier."
}
```

## Demo Flow

1. Seed the database.
2. Open the React dashboard.
3. Upload a new settlement batch.
4. Trigger reconciliation manually.
5. Inspect discrepancies and logs.
6. Observe webhook deliveries in your configured endpoint.

## Verified Notes

- Local mode runs backend on `http://localhost:5050`
- Docker mode exposes only the frontend on `http://localhost:5173`
- If you want notification delivery success, replace `NOTIFICATION_WEBHOOK_URL` with a real `webhook.site` URL or mock endpoint

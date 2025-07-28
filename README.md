# Portfolio Manager

A full-stack portfolio management application built with Vue 3, Element Plus, Express.js and MySQL.

## Architecture

```
frontend (Vite + Vue3 + ElementPlus)  <--->  backend (Express.js REST API)  <--->  MySQL
                                      |                                    
                                      +-->  Yahoo Finance (live quotes)
```

## Getting Started

### Prerequisites

* Node.js 18+
* MySQL 8+

### Backend Setup

```bash
cd backend
cp .env.sample .env # adjust DB credentials
npm install
# import schema
mysql -u<user> -p < schema.sql
npm run dev # or npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Build for Production

```bash
# frontend
npm run build
# backend – ensure PORT is set then start
npm start
```

## API Endpoints

* `GET    /api/assets` – list assets
* `POST   /api/assets` – create asset
* `GET    /api/assets/:id` – asset by id
* `PUT    /api/assets/:id` – update asset
* `DELETE /api/assets/:id` – delete asset
* `GET    /api/quotes/:symbol` – realtime quote via Yahoo Finance

## License

MIT

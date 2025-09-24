# Mixopidia Backend

Node.js/Express + MongoDB backend built with CommonJS, JWT (HS256), Joi validation, and Binance proxy.

## Requirements

- Node.js 20+
- MongoDB 5+

## Setup

1. Copy `.env.example` to `.env` and adjust values if needed.

```
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/mixopidia
JWT_SECRET=replace-with-strong-secret
BINANCE_REST=https://api.binance.com
```

2. Install dependencies:

```
npm install
```

3. Run in dev mode with nodemon:

```
npm run dev
```

4. Or run in production mode:

```
npm start
```

Server runs on `http://localhost:4000` by default and allows CORS from `http://localhost:3000`.

## API Contract

- `GET /api/ping` -> `{ "message": "pong" }`

Auth (rate limit: 10 requests / 5 min):
- `POST /api/auth/register` `{ email, password }` -> `{ token, user: { id, email } }`
- `POST /api/auth/login`    `{ email, password }` -> `{ token, user: { id, email } }`

Markets:
- `GET /api/markets` -> `[ { symbol, base, quote, status } ]`

Market Data (proxied to Binance, symbol normalized e.g. `BNB/USDT` -> `BNBUSDT`):
- `GET /api/market-data/ticker?symbol=BNB/USDT`
- `GET /api/market-data/depth?symbol=BNB/USDT&limit=50`
- `GET /api/market-data/trades?symbol=BNB/USDT&limit=50`

Orders (auth required; rate limit: 30 requests / min on `/api/orders`):
- `POST /api/orders` `{ symbol, side, type, quantity, price?, stopPrice? }` -> `{ ok: true, order }`
- `GET /api/orders/open` -> `{ ok: true, rows: [...] }`

User (auth required):
- `GET /api/user/transactions` -> `{ ok: true, rows: [...] }`
- `POST /api/user/withdraw` `{ asset, address, amount }` -> `{ ok: true, requestId }`

## Error Handling

All errors return JSON in the form `{ "error": "message" }` with proper HTTP status codes. Includes global 404 and error handler.


# MIXOPIDIA — Exchange (BSC, self-custody)

## Project Handover Statement

### 1) Scope & Status

- Project: Mixopidia CEX (single-chain launch on BSC), self-custody architecture.
- Stack: Node/Express + MongoDB backend, React + Vite frontend (original UI preserved; only data wiring).
- Current status:
  - Markets/ticker/depth/trades endpoints working.
  - Auth endpoints available and client wired (token persisted).
  - Test order form in place; production trade box wiring is next.
  - UI design untouched.

---

### 2) Codebase & Paths

- Frontend (React + Vite): `C:\\Users\\ikari\\Excahnge\\React Version\\React Version`
- Backend (Node/Express): `C:\\Users\\ikari\\Excahnge\\backend`
- Ports:
  - Frontend dev: typically `http://localhost:5173` (Vite default) unless configured to `3000`.
  - Backend API: `http://localhost:4000`

---

### 3) Environment & Secrets

- Frontend `.env`
  - `REACT_APP_API_BASE=http://localhost:4000`
- Backend env (example)
  - `PORT=4000`
  - `MONGO_URI=<your mongodb>`
  - `JWT_SECRET=<set a strong secret>`
  - `CORS_ORIGIN=http://localhost:5173` (match your frontend dev port)

See `.env.example` for additional optional keys.

---

### 4) Backend Endpoints (implemented)

- Public markets (no auth):
  - `GET /api/markets`
  - `GET /api/market-data/ticker?symbol=BNB/USDT`
  - `GET /api/market-data/depth?symbol=BNB/USDT&limit=50`
  - `GET /api/market-data/trades?symbol=BNB/USDT&limit=50`
- Auth:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- Wallet (token required):
  - `GET /api/wallet/transactions`
  - `POST /api/wallet/withdraw`
- Orders (token required):
  - `POST /api/orders` (create)
  - `GET /api/orders?status=open|closed` (list mine)
  - `POST /api/orders/:id/cancel` (cancel mine)

Notes:
- Public market endpoints are mounted via a single router (`routes/marketPublicRoutes.js`) at `/api`.
- Ensure only one mount path for wallet routes: `app.use('/api/wallet', walletRoutes)`.

---

### 5) Frontend Integration (no design changes)

- Axios client + token management: `src/lib/api.js`
  - Sets `baseURL` from `REACT_APP_API_BASE`.
  - Saves token to `localStorage` and attaches `Authorization: Bearer <token>`.
  - Exposes helpers: `auth.register/login/logout`, `orders.create/open`, `wallet.transactions/withdraw`.
- Auth UI (temporary test box): `src/components/AuthBox.js`
  - Login/Register → stores token → ready for protected calls.
- Orders test tool (temporary, for QA): `src/pages/DevOrdersTest.js`
  - Simple LIMIT/MARKET/STOP/STOP_LIMIT submit to `/api/orders`.
- Entry + build config:
  - `src/main.jsx` (React 18 `createRoot`)
  - `index.html` with `<div id="root"></div>` and `<script type="module" src="/src/main.jsx">`
  - `vite.config.js`: React plugin + JSX loader for `.js` files
  - `jsconfig.json`: `jsx: react-jsx`

---

### 6) Dependencies added

- Runtime: `axios@^1`, `react-router-dom@5.3.4`, `react-router@5.3.4`, `history@4`, `sass@^1.69`
- React core pinned: `react@18.3.1`, `react-dom@18.3.1`
- Chart widget: `react-tradingview-embed@1.4.0`
- Carousel: `react-slick@0.29.0`, `slick-carousel@1.8.1`
  - CSS imports required in `src/components/MarketCarousel.js`:
    ```js
    import 'slick-carousel/slick/slick.css';
    import 'slick-carousel/slick/slick-theme.css';
    ```
- Dev: `@vitejs/plugin-react`

---

### 7) How to run (local)

Backend

```powershell
cd "C:\\Users\\ikari\\Excahnge\\backend"
npm i
npm run dev
```

Frontend

```powershell
cd "C:\\Users\\ikari\\Excahnge\\React Version\\React Version"
npm i
# Vite default
npm run dev
# If configured to 3000, you may also use
# npm start
```

---

### 8) QA Checklist (what works now)

- Open frontend → app loads.
- Auth: Register and Login via AuthBox → token saved in `localStorage`.
- Markets: Lists/order book/recent trades load (via `/api/markets`, `/api/market-data/*`).
- Orders (dev test): Use DevOrdersTest to place a LIMIT/MARKET order → returns created order JSON.
- Protected endpoints: After login, `GET /api/wallet/transactions` and `POST /api/wallet/withdraw` succeed (via helpers).

---

### 9) Known Issues / Notes

- If you see a Vite overlay for `react-slick`, run:
  ```powershell
  npm i react-slick@0.29.0 slick-carousel@1.8.1
  # ensure CSS imports exist in MarketCarousel.js (see above)
  ```
- If you see “JSX syntax extension not enabled”, ensure `vite.config.js` includes the JSX loader for `.js`.
- If you see a blank page with 404 in console, ensure `index.html` has `#root` and script to `/src/main.jsx`.
- Backend CORS: make sure `CORS_ORIGIN` matches your actual frontend URL/port.

---

### 10) Next Actions (priority)

1. Wire the production Buy/Sell forms to `orders.create()` and reuse validations from DevOrdersTest.
2. MyTransactions tab → load `wallet.transactions()` with token, render in existing table.
3. Withdraw form → submit via `wallet.withdraw()` with token + inline validation.
4. Add basic toast messages (success/error) using the project’s existing notification pattern (no CSS changes).
5. Set real `JWT_SECRET`, `MONGO_URI`, and enable proper validation/rate-limits for production.

---

### 11) Backups / Rollback

- Frontend: `App.backup.js` created when temporarily mounting test components.
- Backend: multiple `server.*.backup.js` snapshots exist before route cleanup.

---

### 12) Ownership & Handoff

- No credentials are included in the repo. Add your own `.env` for API and DB.
- All changes preserve the original design; only data wiring and minimal utilities were added.
- Zips (frontend/backend) reflect this state.

---

If you want this handover as a PDF as well, say so and I’ll export it.


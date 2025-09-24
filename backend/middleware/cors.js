const cors = require("cors");

const raw = process.env.CORS_ORIGIN || "";
const ALLOWED = raw.split(",").map(s => s.trim()).filter(Boolean);

module.exports = cors({
  origin(origin, cb) {
    // allow server-to-server / curl (no origin)
    if (!origin) return cb(null, true);
    if (ALLOWED.includes(origin)) return cb(null, true);
    // allow localhost/127.0.0.1 on any port during dev
    if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/i.test(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  preflightContinue: false,
  optionsSuccessStatus: 204
});

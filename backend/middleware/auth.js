const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const secret = process.env.JWT_SECRET || "changeme";
    const payload = jwt.verify(token, secret);
    req.user = { id: payload.id, role: payload.role || "user" };
    next();
  } catch (e) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

function requireAdmin(req, res, next) {
  // First ensure the user is authenticated
  auth(req, res, (err) => {
    if (err) return next(err);
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  });
}

// CommonJS export: default is `auth`, with named helpers for flexibility
module.exports = auth;
module.exports.requireAuth = auth;
module.exports.requireAdmin = requireAdmin;

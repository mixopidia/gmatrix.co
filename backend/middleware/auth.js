const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
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
};

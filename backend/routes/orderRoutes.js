const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/orderController");

router.use(auth);
router.get("/", ctrl.listOrders);           // GET   /api/orders?status=open|closed
router.post("/", ctrl.createOrder);         // POST  /api/orders
router.post("/:id/cancel", ctrl.cancelOrder); // POST /api/orders/:id/cancel

module.exports = router;

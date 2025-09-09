const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/walletController");

router.use(auth);
router.get("/transactions", ctrl.listTransactions); // GET  /api/wallet/transactions
router.post("/withdraw", ctrl.createWithdraw);      // POST /api/wallet/withdraw

module.exports = router;

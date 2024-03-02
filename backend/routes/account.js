const mongoose = require("mongoose");
const express = require("express");
const { authMiddleware } = require("../middleware");
const {Account} = require("../db");
const router = express.Router();

// Get balance of a user account
router.get("/balance", authMiddleware, async (req, res) => {
  try {
    const account = await Account.findOne({
      userId: req.userId,
    });

    return res.status(200).json({
      balance: account.balance,
    });
  } catch (error) {
    console.log(`Error found: ${error}`);
  }
});

// transfer money from one account to another account
router.post("/transfer", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();

  await session.startTransaction();

  const { to, amount } = req.body;

  // fetch the accounts witin the transaction
  const fromAccount = await Account.findOne({ userId: req.userId }).session(
    session
  );

  if (fromAccount.balance < amount) {
    await session.abortTransaction();
    return res.status(400).json({
      message: "Insufficient balance",
    });
  }

  const toAccount = await Account.findOne({ userId: to }).session(session);
  if (!toAccount) {
    await session.abortTransaction();
    return res.status(400).json({
      message: "Invalid account",
    });
  }

  // perform the transfer
  await Account.updateOne(
    { userId: req.userId },
    { $inc: { balance: -amount } }
  ).session(session);
  await Account.updateOne(
    { userId: to },
    { $inc: { balance: amount } }
  ).session(session);

  // Commit the transfer
  await session.commitTransaction();

  return res.status(200).json({
    message: "Transaction successful",
  });
});

module.exports = router;

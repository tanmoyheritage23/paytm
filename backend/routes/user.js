const express = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { JWT_SECRET }= require("../config");
const { User, Account } = require("../db");
const bcrypt = require("bcrypt");
const { authMiddleware } = require("../middleware");
const router = express.Router();

/* Signup route */
const signupBody = zod.object({
  username: zod.string().email(),
  password: zod.string(),
  firstName: zod.string(),
  lastName: zod.string(),
});

router.post("/signup", async (req, res) => {
  try {
    const { success } = signupBody.safeParse(req.body);
    if (!success) {
      return res.status(400).json({
        message: "Incorrect inputs",
      });
    }

    const existingUser = await User.findOne({
      username: req.body.username,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already taken / Incorrect inputs",
      });
    }

    const hashPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      username: req.body.username,
      password: hashPassword,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    });

    const userId = user._id;

    // giving random balance to account
    await Account.create({
      userId,
      balance: 1 + Math.random() * 10000,
    });

    // const token = await jwt.sign({ userId }, JWT_SECRET);
    return res.status(201).json({
      message: "User created successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Signup failed!!",
      error: err,
    });
  }
});

/* Signin route */
const signinBody = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});
router.post("/signin", async (req, res) => {
  try {
    const { success } = signinBody.safeParse(req.body);
    if (!success) {
      return res.status(400).json({
        message: "Email already taken / Incorrect inputs",
      });
    }

    let fetchedUser;
    const validUser = await User.findOne({
      username: req.body.username,
    }).then((user) => {
      if (!user) {
        return res.status(404).json({
          message: "user doesn't exist",
        });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    });

    //console.log(validUser);

    if (!validUser) {
      return res.status(403).json({
        message: "Invalid user",
      });
    }

    const userId = fetchedUser._id;
    //console.log(userId);
    const token = await jwt.sign({ userId }, JWT_SECRET);

    return res.status(200).json({
      token: token,
      userId: userId,
    });
  } catch (err) {
    return res.status(401).json({
      message: "Authentication failed!",
      error: err,
    });
  }
});





/* Update user information route */
const updateBody = zod.object({
  password: zod.string().optional(),
  firstName: zod.string().optional(),
  lastName: zod.string().optional(),
});

router.put("/update", authMiddleware, (req, res) => {
  const { success } = updateBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Error while updating information",
    });
  }

  User.updateOne({ _id: req.userId }, req.body, (error, result) => {
    if (error) {
      console.error("Update operation failed!", error);
    } else {
      return res.status(200).json({
        message: "Updated successfully",
      });
    }
  });
});

/* Search users route */
router.get("/search", async (req, res) => {
  const filter = req.query.filter;
  const users = await User.find({
    $or: [
      {
        firstName: {
          $regex: filter,
        },
      },
      {
        lastName: {
          $regex: filter,
        },
      },
    ],
  });

  return res.json({
    user: users.map(({ username, firstName, lastName, _id }) => ({
      username,
      firstName,
      lastName,
      _id,
    })),
  });
});

module.exports = router;

const express = require("express");
const { authMiddleware } = require("../middleware");
const { userSchema, signinSchema, updateSchema } = require("../zodSchemas");
const { User, Account } = require("../db");
const { JWT_SECRET } = require("../config");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.post("/signup", async (req, res) => {
  const body = req.body;
  const { success } = userSchema.safeParse(body);
  if (!success) {
    return res.status(411).json({
      msg: "1 Email areasy exists/ Invalid inputs",
    });
  }
  const user = await User.findOne({
    userName: body.userName,
  });
  if (user) {
    return res.status(411).json({
      msg: "2 Email areasy exists/ Invalid inputs",
    });
  }
  console.log(body);
  const dpUser = await User.create(body);
  const token = jwt.sign(
    {
      userId: dpUser._id,
    },
    JWT_SECRET
  );
  const userId = dpUser._id;
  await Account.create({
    user: userId,
    balance: 1 + Math.random() * 10000,
  });

  res.status(200).send({
    message: "User created successfully",
    token: token,
  });
});

router.get("/signin", async (req, res) => {
  const body = req.body;
  const { success } = signinSchema.safeParse(body);
  console.log(body);
  if (!success) {
    return res.status(401).json({
      msg: "Error while logging in",
    });
  }
  const user = await User.findOne({
    userName: body.userName,
    password: body.password,
  });

  if (!user) {
    return res.status(401).json({
      msg: "Error while logging in",
    });
  }
  const token = jwt.sign({ userId: user._id }, JWT_SECRET);
  return res.status(201).json({
    token: token,
  });
});

router.put("/", authMiddleware, async (req, res) => {
  const body = req.body;
  const { success } = updateSchema.safeParse(body);
  if (!success)
    return res.status(411).json({
      message: "Error while updating information",
    });
  await User.findOneAndUpdate({ _id: req.userId }, body);
  return res.status(200).json({
    message: "Updated successfully",
  });
});
router.get("/bulk", async (req, res) => {
  const filter = req.query.filter || "";

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

  res.json({
    user: users.map((user) => ({
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName,
      _id: user._id,
    })),
  });
});

module.exports = router;

import express from "express";
import { User } from "../models/Users";
import path from "path";
import * as dotenv from "dotenv";
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

dotenv.config({ path: path.resolve(__dirname, "../..") + "/.env" });

const EXPIRESIN = "3600";
const getToken = (email: string): string => {
  const payload = { email };
  const secret = process.env.SECRET_KEY!;
  const token = jwt.sign(payload, secret, {
    expiresIn: EXPIRESIN,
  });
  return token;
};

router.post("/signup", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    console.log(User);
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(409).json({ message: "EMAIL_ALREADY_EXISTS" });
      // res.send(409, { error: "EMAIL_ALREADY_EXISTS" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ email, username, password: hashedPassword });

    const user = await newUser.save();
    const userId = user.id;
    const token = getToken(email);
    res.status(200).json({ message: "USER_CREATED", token, expiresIn: EXPIRESIN, username, userId });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({ message: "USER_DOES_NOT_EXIST" });
    }

    const isValidPassword = await bcrypt.compare(password, existingUser.password);

    console.log(isValidPassword);
    if (!isValidPassword) {
      return res.status(401).json({ message: "INCORRECT_PASSWORD" });
    }

    const token = getToken(email);
    const userId = existingUser.id;
    res.status(200).json({ message: "LOGGED_IN", token, expiresIn: EXPIRESIN, username: existingUser.username, userId });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

export default router;

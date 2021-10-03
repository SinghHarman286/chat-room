import { Request, Response, NextFunction } from "express";
import path from "path";
import * as dotenv from "dotenv";

const jwt = require("jsonwebtoken");

dotenv.config({ path: path.resolve(__dirname, "../..") + "/.env" });

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const tokenString = req.headers["authorization"] as string;
  if (!tokenString || !tokenString.startsWith("Bearer")) return res.status(401).json("Unauthorize user");
  const token = tokenString.split(" ")[1];
  if (!token) return res.status(401).json("Unauthorize user");

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    next();
  } catch (e) {
    res.status(401).json("Token not valid");
  }
};
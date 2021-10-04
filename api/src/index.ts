import express from "express";
import mongoose from "mongoose";
import path from "path";
import * as dotenv from "dotenv";

import authRoute from "./routes/auth";
import roomRoute from "./routes/room";
import chatRoute from "./routes/chat";

import { json } from "body-parser";
import http from "http";
import socketConnection from "./utils/socket-io";
import { verifyToken } from "./middlewares/auth-middleware";

dotenv.config({ path: path.resolve(__dirname, "..") + "/.env" });

const app = express();
const router = express.Router();
const server = http.createServer(app);
const cors = require("cors");

socketConnection(server);

app.use(json());
app.use(cors());

app.use("/api/auth", authRoute);
app.use(verifyToken);
app.use("/api/room", roomRoute);
app.use("/api/chat", chatRoute);

app.all("*", () => {
  throw new Error("Route not available");
});

// start the db
const start = async () => {
  console.log("Starting DB Server");
  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("Connected to DB");
  } catch (err) {
    console.log(err);
  }
};

server.listen(process.env.PORT || 4000, () => {
  console.log(`Listening on port ${process.env.PORT || 4000}`);

  start();
});

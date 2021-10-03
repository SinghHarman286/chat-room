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

const cors = require("cors");
const app = express();
const server = http.createServer(app);

socketConnection(server);

app.use(json());
app.use(cors());
const router = express.Router();

dotenv.config({ path: path.resolve(__dirname, "..") + "/.env" });

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
    await mongoose.connect(process.env.MONGODB_URL!, {
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
  console.log("Listening on port 4000!!");

  start();
});

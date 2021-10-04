import express from "express";
import { Room } from "../models/Room";
import path from "path";
import * as dotenv from "dotenv";
const jwt = require("jsonwebtoken");
const router = express.Router();

dotenv.config({ path: path.resolve(__dirname, "../..") + "/.env" });

router.get("/getAdmin/:roomId", async (req, res) => {
  // this route handles fetching of the admin of a room of id - roomid
  try {
    const existingRoom = await Room.findOne({ _id: req.params.roomId });

    res.status(200).json({ admin: existingRoom.admin });
  } catch (err: any) {
    console.log(err);
    return res.status(500).json(err);
  }
});

router.post("/newRoom", async (req, res) => {
  // this route handles addition of a new room with name "name" created by user
  // of id : userId
  const { name, userId } = req.body;

  try {
    const existingRoom = await Room.findOne({ name });

    if (existingRoom) {
      // if an existing room exist, then room with the same name should not be created
      return res.status(409).json({ message: "Room already exists" });
    }

    const newRoom = new Room({ name, admin: userId, members: [userId] });
    const room = await newRoom.save();

    res.status(200).json({ message: "Success" });
  } catch (err: any) {
    console.log(err);
    return res.status(500).json(err);
  }
});

router.post("/deleteMember", async (req, res) => {
  // this route handles removal of a member with id: userId from room of id: roomId
  const { userId, roomId } = req.body;

  if (!userId || !roomId) {
    return res.status(403).json({ message: "Invalid Request" });
  }
  try {
    // pulling the member from the members array
    await Room.findOneAndUpdate({ _id: roomId }, { $pull: { members: userId } });

    res.status(200).json({ message: "Success" });
  } catch (err: any) {
    return res.status(500).json(err);
  }
});

router.post("/addMember", async (req, res) => {
  // this route handles addition a new member of id userId to a room of id roomId
  const { userId, roomId } = req.body;

  if (!userId || !roomId) {
    return res.status(403).json({ message: "Invalid Request" });
  }
  try {
    // pushing the member in the member array
    await Room.findOneAndUpdate({ _id: roomId }, { $push: { members: userId } });

    res.status(200).json({ message: "Success" });
  } catch (err: any) {
    return res.status(500).json(err);
  }
});

router.get("/getRoom/:userId", async (req, res) => {
  // this route handles fetching of rooms created/joined by user of id: userId
  const userId = req.params.userId;
  interface IRoom {
    members: [number];
    conversations: [number];
    _id: number;
    name: string;
  }
  const rooms = await Room.find({ members: { $in: [userId] } });

  const chatRooms = rooms.map((room: IRoom) => ({ id: room._id, name: room.name }));
  res.status(200).json({ rooms: chatRooms });
});
export default router;

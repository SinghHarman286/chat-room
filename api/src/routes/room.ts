import express from "express";
import { Room } from "../models/Room";
import path from "path";
import * as dotenv from "dotenv";
const router = express.Router();

dotenv.config({ path: path.resolve(__dirname, "../..") + "/.env" });

router.post("/newRoom", async (req, res) => {
  const { name, userId } = req.body;

  try {
    const existingRoom = await Room.findOne({ name });

    if (existingRoom) {
      return res.status(409).json({ message: "Room already exists" });
    }

    const newRoom = new Room({ name, members: [userId] });
    const room = await newRoom.save();

    res.status(200).json({ message: "Success" });
  } catch (err: any) {
    return res.status(500).json(err);
  }
});

router.post("/deleteMember", async (req, res) => {
  const { userId, roomId } = req.body;

  if (!userId || !roomId) {
    return res.status(403).json({ message: "Invalid Request" });
  }
  try {
    await Room.findOneAndUpdate({ _id: roomId }, { $pull: { members: userId } });

    res.status(200).json({ message: "Success" });
  } catch (err: any) {
    return res.status(500).json(err);
  }
});

router.post("/addMember", async (req, res) => {
  const { userId, roomId } = req.body;

  if (!userId || !roomId) {
    return res.status(403).json({ message: "Invalid Request" });
  }
  try {
    await Room.findOneAndUpdate({ _id: roomId }, { $push: { members: userId } });

    res.status(200).json({ message: "Success" });
  } catch (err: any) {
    return res.status(500).json(err);
  }
});

router.get("/getRoom/:userId", async (req, res) => {
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

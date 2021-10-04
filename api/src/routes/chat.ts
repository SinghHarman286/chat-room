import express from "express";
import { Room } from "../models/Room";
import { Message } from "../models/Message";
import { User } from "../models/Users";
import path from "path";
import * as dotenv from "dotenv";
const router = express.Router();

dotenv.config({ path: path.resolve(__dirname, "../..") + "/.env" });

router.get("/getUserToAdd/:roomId", async (req, res) => {
  // this route handles fetching of users that are currently not in room of id - roomId
  // and sends an array of those users
  try {
    const userResponse = await User.find({});
    // userResArr contains array of all users
    let userResArr = userResponse.map((user: { _id: string; email: string }) => ({ id: user._id, email: user.email }));
    const roomResponse = await Room.find({ _id: req.params.roomId });
    const roomResponseArr = roomResponse[0].members;
    // filtering to remove current user in the room from userResArr
    userResArr = userResArr.filter((user: { id: string; email: string }) => !roomResponseArr.includes(user.id));
    res.status(200).json({ user: userResArr });
  } catch (err) {
    console.log(err);
    res.status(403).json({});
  }
});

router.get("/getUserToDelete/:roomId", async (req, res) => {
  // this route handles fetching of users that are currently in room of id - roomId
  // and sends an array of those users
  try {
    const roomResponse = await Room.find({ _id: req.params.roomId }).populate("members");
    const roomResArr = roomResponse[0].members.map((user: { _id: string; email: string }) => ({ id: user._id, email: user.email }));
    res.status(200).json({ user: roomResArr });
  } catch (err) {
    console.log(err);
    res.status(403).json({});
  }
});

router.post("/newMessage", async (req, res) => {
  // this route handles addition of a new message given by a user of id userId
  // and room of id roomId
  const { message, userId, username, roomId } = req.body;

  if (message.trim() === "") {
    // not storing empty messages
    return res.status(403).json({ message: "Cannot Process Empty Message" });
  }
  const newMessage = new Message({ userId, username, message: message.trim() });
  const messageSaved = await newMessage.save();

  // pushing the new message in the conversations array
  await Room.findOneAndUpdate({ _id: roomId }, { $push: { conversations: messageSaved._id } });
  const response = await Room.find({ _id: roomId }).populate("conversations");
  res.status(200).json({ conversations: response[0].conversations });
});

router.get("/getChat/:roomId", async (req, res) => {
  // this route handles fetching of messages for a room of id - roomId
  // and sends an array of those messages
  const roomId = req.params.roomId;

  interface IConversation {
    id: string;
    userId: string;
    message: string;
    __v: string;
  }
  let conversations: IConversation[] = [];
  const response = await Room.find({ _id: roomId }).populate("conversations");

  res.status(200).json({ conversations: response[0].conversations });
});

export default router;

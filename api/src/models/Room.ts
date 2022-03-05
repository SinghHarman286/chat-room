import mongoose, { Schema, Document } from "mongoose";
import { User } from "./Users";
import { Message } from "./Message";

export interface Room extends Document {
  id: string;
  name: string;
  admin: Schema.Types.ObjectId | User;
  members: (Schema.Types.ObjectId | User)[];
  conversations: (Schema.Types.ObjectId | Message)[];
}
const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  conversations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
});

const MgRoom = mongoose.model<Room>("Room", roomSchema);

export default MgRoom;

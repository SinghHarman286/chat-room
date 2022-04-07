import mongoose, { Document, Schema } from "mongoose";

export interface Message extends Document {
  userId: Schema.Types.ObjectId | string;
  username: string;
  message: string;
}
const MessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  username: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});

const MgMessage = mongoose.model<Message>("Message", MessageSchema);

export default MgMessage;

import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true }],
  conversations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
});

const Room = mongoose.model("Room", roomSchema);

export { Room };

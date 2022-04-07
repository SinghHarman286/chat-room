import mongoose, { Document } from "mongoose";

export interface User extends Document {
  id: string;
  email: string;
  username: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const MgUser = mongoose.model<User>("User", userSchema);

export default MgUser;

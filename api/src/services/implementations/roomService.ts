import { getAdminDTO, GetRoomDTO, SuccessMessageDTO, ErrorMessageDTO } from "../../types";
import IRoomService from "../interfaces/roomService";
import MgRoom, { Room } from "../../models/Room";
import { User } from "../../models/Users";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../..") + "/.env" });

class RoomService implements IRoomService {
  async getAdmin(roomId: string): Promise<getAdminDTO> {
    try {
      const existingRoom: Room | null = await MgRoom.findOne({ _id: roomId }).populate("admin");
      if (!existingRoom) {
        throw new Error(`no room exists with the id ${roomId}`);
      }
      const admin = existingRoom.admin as User;
      return { statusCode: 200, admin: admin.id };
    } catch (err: unknown) {
      throw err;
    }
  }

  async addRoom(name: string, userId: string): Promise<SuccessMessageDTO | ErrorMessageDTO> {
    try {
      const existingRoom: Room | null = await MgRoom.findOne({ name });

      if (existingRoom) {
        // if an existing room exist, then room with the same name should not be created
        return { statusCode: 409, message: "Room already exists" };
      }

      const newRoom: Room = await MgRoom.create({ name, admin: userId, members: [userId] });

      return { statusCode: 200, message: "Success" };
    } catch (err: unknown) {
      console.log(err);
      throw err;
    }
  }

  async removeMember(userId: string, roomId: string): Promise<SuccessMessageDTO | ErrorMessageDTO> {
    try {
      if (!userId || !roomId) {
        return { statusCode: 403, message: "Invalid Request" };
      }
      // pulling the member from the members array
      await MgRoom.findOneAndUpdate({ _id: roomId }, { $pull: { members: userId } });

      return { statusCode: 200, message: "Success" };
    } catch (err: unknown) {
      throw err;
    }
  }

  async addMember(userId: string, roomId: string): Promise<SuccessMessageDTO | ErrorMessageDTO> {
    try {
      if (!userId || !roomId) {
        return { statusCode: 403, message: "Invalid Request" };
      }
      // pushing the member in the member array
      await MgRoom.findOneAndUpdate({ _id: roomId }, { $push: { members: userId } });

      return { statusCode: 200, message: "Success" };
    } catch (err: unknown) {
      throw err;
    }
  }

  async getRoom(userId: string): Promise<GetRoomDTO> {
    try {
      const rooms: Room[] = await MgRoom.find({ members: { $in: [userId] } });
      const chatRooms = rooms.map((room) => ({ id: room.id, name: room.name }));
      return { statusCode: 200, rooms: chatRooms };
    } catch (err: unknown) {
      throw err;
    }
  }
}

export default RoomService;

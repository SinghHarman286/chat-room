import { getUserToAddDTO, getUserToDeleteDTO, createMessageDTO, getChatDTO, ErrorMessageDTO } from "../../types";
import IChatService from "../interfaces/chatService";
import MgRoom, { Room } from "../../models/Room";
import MgMessage, { Message } from "../../models/Message";
import MgUser, { User } from "../../models/Users";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../../") + "/.env" });

class ChatService implements IChatService {
  async getUserToAdd(roomId: string): Promise<getUserToAddDTO> {
    try {
      const userResponse: User[] = await MgUser.find({});

      // userResArr contains array of all users
      let userResArr = userResponse.map((user: User) => ({ id: user.id, email: user.email }));

      const roomResponse: Room[] = await MgRoom.find({ _id: roomId }).populate("members");
      const members = roomResponse[0].members as User[];
      const roomResponseArr = members.map((member) => member.id);

      // filtering to remove current user in the room from userResArr
      userResArr = userResArr.filter((user) => !roomResponseArr.includes(user.id));
      return { statusCode: 200, user: userResArr };
    } catch (err: unknown) {
      throw err;
    }
  }

  async getUserToDelete(roomId: string): Promise<getUserToDeleteDTO> {
    try {
      const roomResponse: Room[] = await MgRoom.find({ _id: roomId }).populate("members");
      const members = roomResponse[0].members as User[];
      const roomResArr = members.map((member) => ({ id: member.id, email: member.email }));
      return { statusCode: 200, user: roomResArr };
    } catch (err: unknown) {
      throw err;
    }
  }

  async createMessage(
    message: string,
    userId: string,
    username: string,
    roomId: string
  ): Promise<createMessageDTO | ErrorMessageDTO> {
    try {
      if (message.trim() === "") {
        // not storing empty messages
        return { statusCode: 403, message: "Cannot Process Empty Message" };
      }
      const newMessage = await MgMessage.create({ userId, username, message: message.trim() });

      // pushing the new message in the conversations array
      await MgRoom.findOneAndUpdate({ _id: roomId }, { $push: { conversations: newMessage.id } });
      return this.getChat(roomId);
    } catch (err: unknown) {
      throw err;
    }
  }

  async getChat(roomId: string): Promise<getChatDTO> {
    try {
      const response = await MgRoom.find({ _id: roomId }).populate("conversations");
      const conversations = response[0].conversations as Message[];

      return {
        statusCode: 200,
        conversations: conversations.map((conversation) => ({
          userId: conversation.userId as string,
          username: conversation.username,
          message: conversation.message,
        })),
      };
    } catch (err: unknown) {
      throw err;
    }
  }
}

export default ChatService;

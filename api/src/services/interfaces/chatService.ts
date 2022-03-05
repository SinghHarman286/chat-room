import { getUserToAddDTO, getUserToDeleteDTO, createMessageDTO, getChatDTO, ErrorMessageDTO } from "../../types";

export default interface IChatService {
  /**
   * Retrieve users that can be added in a room
   * @param roomId room's id
   * @returns getUserToAddDTO
   * @throws Error if user retrieval fails
   */
  getUserToAdd(roomId: string): Promise<getUserToAddDTO>;

  /**
   * Retrieve users that can be removed from a room
   * @param roomId room's id
   * @returns getUserToDeleteDTO
   * @throws Error if user retrieval fails
   */
  getUserToDelete(roomId: string): Promise<getUserToDeleteDTO>;

  /**
   * create a new message
   * @param message message's string
   * @param userId user's id creating the message
   * @returns createMessageDTO or ErrorMessageDTO
   * @throws Error if message generation fails
   */
  createMessage(
    message: string,
    userId: string,
    username: string,
    roomId: string
  ): Promise<createMessageDTO | ErrorMessageDTO>;

  /**
   * Retrieve chat of a room
   * @param roomId room's id
   * @returns getChatDTO
   * @throws Error if chat retrieval fails
   */
  getChat(roomId: string): Promise<getChatDTO>;
}

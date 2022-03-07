import { getAdminDTO, GetRoomDTO, IsValidRoomDTO, SuccessMessageDTO, ErrorMessageDTO } from "../../types";

export default interface IRoomService {
  /**
   * Retrieve admin of a room
   * @param roomId room's id
   * @returns getAdminDTO
   * @throws Error if admin retrieval fails
   */
  getAdmin(roomId: string): Promise<getAdminDTO>;

  /**
   * adds a room
   * @param name room's name
   * @param userId user's userId who created the room
   * @returns SuccessMessageDTO or ErrorMessageDTO
   * @throws Error if adding a room fails
   */
  addRoom(name: string, userId: string): Promise<SuccessMessageDTO | ErrorMessageDTO>;

  /**
   * removes a member from a room
   * @param name member's name
   * @param userId member's userId
   * @returns SuccessMessageDTO or ErrorMessageDTO
   * @throws Error if removing a member fails
   */
  removeMember(userId: string, roomId: string): Promise<SuccessMessageDTO | ErrorMessageDTO>;

  /**
   * adds a member to a room
   * @param name member's name
   * @param userId member's userId
   * @returns SuccessMessageDTO or ErrorMessageDTO
   * @throws Error if adding a member fails
   */
  addMember(userId: string, roomId: string): Promise<SuccessMessageDTO | ErrorMessageDTO>;

  /**
   * gets all room created by a user
   * @param userId user's id
   * @returns GetRoomDTO
   * @throws Error if room retrieval fails
   */
  getRoom(userId: string): Promise<GetRoomDTO>;

  /**
   * checks if a room is valid and if the user is authorized to access the room
   * @param roomId room's id
   * @param userId user's id
   * @returns isValidRoomDTO
   * @throws Error if room retrieval fails
   */
  isValidRoom(roomId: string, userId: string): Promise<IsValidRoomDTO>;
}

export type SuccessMessageDTO = {
  statusCode: number;
  message: string;
};

export type ErrorMessageDTO = {
  statusCode: number;
  message: string;
};

export type UserDTO = {
  id: string;
  token: string;
  expiresIn: string;
  email: string;
  username: string;
  userId: string;
};

export type CreateUserDTO = Omit<UserDTO, "email" | "id"> & { statusCode: number; message: string };

export type LoginUserDTO = Omit<UserDTO, "email" | "id"> & { statusCode: number; message: string };

export type getUserToAddDTO = { user: Pick<UserDTO, "id" | "email">[]; statusCode: number };

export type getUserToDeleteDTO = { user: Pick<UserDTO, "id" | "email">[]; statusCode: number };

export type ChatDTO = {
  userId: string;
  username: string;
  message: string;
};

export type createMessageDTO = { conversations: ChatDTO[]; statusCode: number };

export type getChatDTO = { conversations: ChatDTO[]; statusCode: number };

export type RoomDTO = {
  id: string;
  name: string;
  admin: string;
  members: string[];
  conversations: string[];
};

export type getAdminDTO = Pick<RoomDTO, "admin"> & { statusCode: number };

export type GetRoomDTO = { rooms: Pick<RoomDTO, "id" | "name">[]; statusCode: number };

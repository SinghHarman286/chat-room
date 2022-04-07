import { CreateUserDTO, LoginUserDTO, ErrorMessageDTO } from "../../types";

interface IAuthService {
  /**
   * Generates a JWT token
   * @param email user's email
   * @returns JWT token string
   * @throws Error if token generation fails
   */
  getToken(email: string): string;

  /**
   * creates a user
   * @param email user's email
   * @param username user's username
   * @param password user's password
   * @returns CreateUserDTO or ErrorMessageDTO
   * @throws Error if token generation fails
   */
  createUser(email: string, username: string, password: string): Promise<CreateUserDTO | ErrorMessageDTO>;

  /**
   * creates a user
   * @param email user's email
   * @param password user's password
   * @returns LoginUserDTO or ErrorMessageDTO
   * @throws Error if token generation fails
   */
  loginUser(email: string, password: string): Promise<LoginUserDTO | ErrorMessageDTO>;
}

export default IAuthService;

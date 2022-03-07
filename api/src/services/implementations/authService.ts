import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import path from "path";
import * as dotenv from "dotenv";
import MgUser, { User } from "../../models/Users";
import IAuthService from "../interfaces/authService";

import { CreateUserDTO, LoginUserDTO, ErrorMessageDTO } from "../../types";

dotenv.config({ path: path.resolve(__dirname, "../../..") + "/.env" });

class AuthService implements IAuthService {
  EXPIRESIN = "3600";

  getToken(email: string): string {
    // creates a new token using email as a payload
    const payload = { email };
    const secret = process.env.SECRET_KEY!;
    const token = jwt.sign(payload, secret, {
      expiresIn: +this.EXPIRESIN,
    });
    return token;
  }

  async createUser(email: string, username: string, password: string): Promise<CreateUserDTO | ErrorMessageDTO> {
    try {
      const existingUser: User | null = await MgUser.findOne({ email });

      if (existingUser) {
        // user already exists
        return { statusCode: 409, message: "EMAIL_ALREADY_EXISTS" };
      }

      // creating a salt and adding it to the password before hashing it
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser: User = await MgUser.create({ email, username, password: hashedPassword });

      const userId = newUser.id;
      const token = this.getToken(email);
      return { statusCode: 200, message: "USER_CREATED", token, expiresIn: this.EXPIRESIN, username, userId };
    } catch (err: unknown) {
      throw err;
    }
  }

  async loginUser(email: string, password: string): Promise<LoginUserDTO | ErrorMessageDTO> {
    try {
      const existingUser: User | null = await MgUser.findOne({ email });

      if (!existingUser) {
        // user does not exist
        return { statusCode: 404, message: "USER_DOES_NOT_EXIST" };
      }

      const isValidPassword = await bcrypt.compare(password, existingUser.password);

      if (!isValidPassword) {
        return { statusCode: 401, message: "INCORRECT_PASSWORD" };
      }

      const token = this.getToken(email);
      const userId = existingUser.id;
      return {
        statusCode: 200,
        message: "LOGGED_IN",
        token,
        expiresIn: this.EXPIRESIN,
        username: existingUser.username,
        userId,
      };
    } catch (err) {
      throw err;
    }
  }
}

export default AuthService;

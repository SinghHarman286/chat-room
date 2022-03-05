import express, { Request, Response } from "express";
import AuthService from "../services/implementations/authService";

const authRouter = express.Router();
const authService = new AuthService();

authRouter.post("/signup", async (req: Request, res: Response) => {
  // this route handles signup of a new user given its email, username and password
  try {
    const response = await authService.createUser(req.body.email, req.body.username, req.body.password);
    const { statusCode, ...responseBody } = response;
    return res.status(statusCode).json(responseBody);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

authRouter.post("/login", async (req: Request, res: Response) => {
  // this route handles login of an existing user given its email, and password
  try {
    const response = await authService.loginUser(req.body.email, req.body.password);
    const { statusCode, ...responseBody } = response;
    return res.status(statusCode).json(responseBody);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

export default authRouter;

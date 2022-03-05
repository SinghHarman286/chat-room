import express, { Request, Response } from "express";
import ChatService from "../services/implementations/chatService";

const chatRouter = express.Router();
const chatService = new ChatService();

chatRouter.get("/getUserToAdd/:roomId", async (req: Request, res: Response) => {
  // this route handles fetching of users that are currently not in room of id - roomId
  // and sends an array of those users
  try {
    const response = await chatService.getUserToAdd(req.params.roomId);
    const { statusCode, ...responseBody } = response;
    res.status(statusCode).json(responseBody);
  } catch (err) {
    console.log(err);
    res.status(403).json({});
  }
});

chatRouter.get("/getUserToDelete/:roomId", async (req: Request, res: Response) => {
  // this route handles fetching of users that are currently in room of id - roomId
  // and sends an array of those users
  try {
    const response = await chatService.getUserToDelete(req.params.roomId);
    const { statusCode, ...responseBody } = response;
    res.status(statusCode).json(responseBody);
  } catch (err) {
    console.log(err);
    res.status(403).json({});
  }
});

chatRouter.post("/newMessage", async (req: Request, res: Response) => {
  // this route handles addition of a new message given by a user of id userId
  // and room of id roomId
  try {
    const response = await chatService.createMessage(
      req.body.message,
      req.body.userId,
      req.body.username,
      req.body.roomId
    );
    const { statusCode, ...responseBody } = response;
    res.status(statusCode).json(responseBody);
  } catch (err) {
    console.log(err);
    res.status(403).json({});
  }
});

chatRouter.get("/getChat/:roomId", async (req: Request, res: Response) => {
  // this route handles fetching of messages for a room of id - roomId
  // and sends an array of those messages
  try {
    const response = await chatService.getChat(req.params.roomId);
    const { statusCode, ...responseBody } = response;
    res.status(statusCode).json(responseBody);
  } catch (err) {
    console.log(err);
    res.status(403).json({});
  }
});

export default chatRouter;

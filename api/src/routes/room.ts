import express, { Request, Response } from "express";
import RoomService from "../services/implementations/roomService";

const roomRouter = express.Router();
const roomService = new RoomService();

roomRouter.get("/getAdmin/:roomId", async (req: Request, res: Response) => {
  // this route handles fetching of the admin of a room of id - roomid
  try {
    const response = await roomService.getAdmin(req.params.roomId);
    const { statusCode, ...responseBody } = response;
    res.status(statusCode).json(responseBody);
  } catch (err: unknown) {
    console.log(err);
    return res.status(500).json(err);
  }
});

roomRouter.post("/newRoom", async (req: Request, res: Response) => {
  // this route handles addition of a new room with name "name" created by user
  // of id : userId
  try {
    const response = await roomService.addRoom(req.body.name, req.body.userId);
    const { statusCode, ...responseBody } = response;
    res.status(statusCode).json(responseBody);
  } catch (err: unknown) {
    console.log(err);
    return res.status(500).json(err);
  }
});

roomRouter.post("/deleteMember", async (req: Request, res: Response) => {
  // this route handles removal of a member with id: userId from room of id: roomId
  try {
    const response = await roomService.removeMember(req.body.userId, req.body.roomId);
    const { statusCode, ...responseBody } = response;
    res.status(statusCode).json(responseBody);
  } catch (err: unknown) {
    console.log(err);
    return res.status(500).json(err);
  }
});

roomRouter.post("/addMember", async (req: Request, res: Response) => {
  // this route handles addition a new member of id userId to a room of id roomId
  try {
    const response = await roomService.addMember(req.body.userId, req.body.roomId);
    const { statusCode, ...responseBody } = response;
    res.status(statusCode).json(responseBody);
  } catch (err: unknown) {
    console.log(err);
    return res.status(500).json(err);
  }
});

roomRouter.get("/getRoom/:userId", async (req: Request, res: Response) => {
  // this route handles fetching of rooms created/joined by user of id: userId
  try {
    const response = await roomService.getRoom(req.params.userId);
    const { statusCode, ...responseBody } = response;
    res.status(statusCode).json(responseBody);
  } catch (err: unknown) {
    console.log(err);
    return res.status(500).json(err);
  }
});

export default roomRouter;

import axios from "axios";
import http, { createServer } from "http";
import { Server, Socket } from "socket.io";

const socketConnection = (server: http.Server) => {
  let io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000"],
    },
  });

  const currentUser: { [userId: string]: string } = {};

  io.on("connection", (socket: Socket) => {
    socket.on("join", ({ userId, socketId }) => {
      currentUser[userId] = socketId;
      socket.join(socketId);
    });
    socket.once("get-room", async ({ userId, body }) => {
      try {
        const response = await axios.get(`http://localhost:4000/api/room/getRoom/${userId}`);
        socket.emit("recieve-room", { result: response.data, body: body });
      } catch (err) {
        socket.emit("recieve-room", []);
      }
    });

    socket.once("add-member-room", async ({ userId, roomId, by }) => {
      try {
        const response = await axios.post(
          "http://localhost:4000/api/room/addMember",
          {
            userId,
            roomId,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const newRoomsRes = await axios.get(`http://localhost:4000/api/room/getRoom/${userId}`);
        io.to(currentUser[userId]).emit("recieve-room", { result: newRoomsRes.data, body: { added: true, by } });
      } catch (err) {}
    });

    socket.once("remove-member-room", async ({ userId, roomId, by }) => {
      try {
        console.log(userId, roomId, by);
        const response = await axios.post(
          "http://localhost:4000/api/room/deleteMember",
          {
            userId,
            roomId,
            by,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const newRoomsRes = await axios.get(`http://localhost:4000/api/room/getRoom/${userId}`);
        io.to(currentUser[userId]).emit("recieve-room", { result: newRoomsRes.data, body: { removed: true, by } });
      } catch (err) {}
    });

    socket.once("get-message", async ({ roomId }) => {
      try {
        const response = await axios.get(`http://localhost:4000/api/chat/getChat/${roomId}`);
        io.emit("recieve-message", response.data);
      } catch (err) {}
    });

    socket.once("post-message", async ({ message, userId, username, roomId }: { message: string; userId: string; username: string; roomId: string }) => {
      try {
        const response = await axios.post(
          `http://localhost:4000/api/chat/newMessage`,
          {
            message,
            userId,
            username,
            roomId,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        io.emit("recieve-message", response.data);
      } catch (err) {
        console.log(err);
      }
    });
  });
};

export default socketConnection;

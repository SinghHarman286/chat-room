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
    socket.once("get-room", async ({ token, userId, body }) => {
      try {
        const response = await axios.get(`http://localhost:4000/api/room/getRoom/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        socket.emit("recieve-room", { result: response.data, body: body });
      } catch (err) {
        socket.emit("recieve-room", { result: { rooms: [] }, body: body });
      }
    });

    socket.once("add-member-room", async ({ token, userId, roomId, by }) => {
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
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const newRoomsRes = await axios.get(`http://localhost:4000/api/room/getRoom/${userId}`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        io.to(currentUser[userId]).emit("recieve-room", { result: newRoomsRes.data, body: { added: true, by } });
      } catch (err) {}
    });

    socket.once("remove-member-room", async ({ token, userId, roomId, by }) => {
      try {
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
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const newRoomsRes = await axios.get(`http://localhost:4000/api/room/getRoom/${userId}`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        io.to(currentUser[userId]).emit("recieve-room", { result: newRoomsRes.data, body: { removed: true, by } });
      } catch (err) {}
    });

    socket.once("get-message", async ({ token, roomId }) => {
      try {
        const response = await axios.get(`http://localhost:4000/api/chat/getChat/${roomId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        io.emit("recieve-message", response.data);
      } catch (err) {}
    });

    socket.once("post-message", async ({ token, message, userId, username, roomId }: { token: string; message: string; userId: string; username: string; roomId: string }) => {
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
              Authorization: `Bearer ${token}`,
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

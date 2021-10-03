import axios from "axios";
import http, { createServer } from "http";
import { Server, Socket } from "socket.io";

const socketConnection = (server: http.Server) => {
  let io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000"],
    },
  });

  // const checkAndSend = async (socket: Socket) => {
  //   let sendResult = [];
  //   let index = 1;
  //   try {
  //     const data = await fetchNewData();

  //     for (let { id, filename } of data.rows) {
  //       sendResult.push({ index, filename, import: id, delete: id });
  //       index += 1;
  //     }
  //     io.emit("recieve-db", sendResult);
  //   } catch (err) {
  //     io.emit("recieve-db", []);
  //   }
  // };

  io.on("connection", (socket: Socket) => {
    socket.on("join", ({ userId }) => {
      socket.join(userId);
    });
    socket.on("get-room", async ({ userId, body }) => {
      try {
        const response = await axios.get(`http://localhost:4000/api/room/getRoom/${userId}`);
        socket.emit("recieve-room", { result: response.data, body: body });
      } catch (err) {
        socket.emit("recieve-room", []);
      }
    });

    socket.on("add-member-room", async ({ userId, roomId, by }) => {
      try {
        console.log("in socket");
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
        console.log("emitting");
        io.to(userId).emit("recieve-room", { result: newRoomsRes.data, body: { added: true, by } });
      } catch (err) {}
    });

    socket.on("get-message", async ({ roomId }) => {
      try {
        const response = await axios.get(`http://localhost:4000/api/chat/getChat/${roomId}`);
        io.emit("recieve-message", response.data);
      } catch (err) {
        console.log(err);
      }
    });

    socket.on("post-message", async ({ message, userId, username, roomId }: { message: string; userId: string; username: string; roomId: string }) => {
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

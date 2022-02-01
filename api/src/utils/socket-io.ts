import axios from "axios";
import http, { createServer } from "http";
import { Server, Socket } from "socket.io";

const PORT = process.env.PORT || 4000;

const socketConnection = (server: http.Server) => {
  let io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000"],
    },
  });

  const currentUser: { [userId: string]: string } = {};
  const usersInVideo: any = {};
  const socketToRoom: any = {};

  // triggerd whenever a new client connects with the socket
  io.on("connection", (socket: Socket) => {
    socket.on("join", ({ userId, socketId }) => {
      // listen to join event and store the userId and respective socketId
      // in the hasmap currentUser and joins that socketId
      currentUser[userId] = socketId;
      socket.join(socketId);
    });

    socket.on("join-video-room", (roomId: string) => {
      if (usersInVideo[roomId]) {
        usersInVideo[roomId].push(socket.id);
      } else {
        usersInVideo[roomId] = [socket.id];
      }
      socketToRoom[socket.id] = roomId;
      const usersInThisRoom = usersInVideo[roomId].filter((id: string) => id !== socket.id);
      socket.emit("users-in-room", usersInThisRoom);
    });

    socket.on("send-signal", (payload) => {
      io.to(payload.userToSignal).emit("user-joined", { signal: payload.signal, callerID: payload.callerID });
    });

    socket.on("return-signal", (payload) => {
      io.to(payload.callerID).emit("receive-returned-signal", { signal: payload.signal, id: socket.id });
    });

    socket.on("disconnect-video", () => {
      const roomId = socketToRoom[socket.id];
      let room = usersInVideo[roomId];
      delete socketToRoom[socket.id];
      if (room) {
        room = room.filter((id: any) => id !== socket.id);
        usersInVideo[roomId] = room;
        for (const user of room) {
          io.to(user).emit("user-left", { id: socket.id });
        }
      }
    });

    socket.once("get-room", async ({ token, userId, body }) => {
      // listens to get-room event and forward request with userId and token to the route
      try {
        const response = await axios.get(`http://localhost:${PORT}/api/room/getRoom/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // emits recieve-room to the client with rooms and body
        socket.emit("recieve-room", { result: response.data, body: body });
      } catch (err) {
        // emits recieve-room to the client with empty rooms and body
        socket.emit("recieve-room", { result: { rooms: [] }, body: body });
      }
    });

    socket.once("add-member-room", async ({ token, userId, roomId, by }) => {
      // listens to add-member-room event and forward request with userId and token to the route
      try {
        const response = await axios.post(
          `http://localhost:${PORT}/api/room/addMember`,
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
        const newRoomsRes = await axios.get(`http://localhost:${PORT}/api/room/getRoom/${userId}`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        // emits 'recieve-room' to a specific client whose id is userId
        // retrieve the respective socketid from the hashmap and emits the data
        // to that socketid
        io.to(currentUser[userId]).emit("recieve-room", { result: newRoomsRes.data, body: { added: true, by } });
      } catch (err) {}
    });

    socket.once("remove-member-room", async ({ token, userId, roomId, by }) => {
      // listens to event 'remove-member-room' and forwards the request to a route with
      // userId, roomId and by
      try {
        const response = await axios.post(
          `http://localhost:${PORT}/api/room/deleteMember`,
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

        const newRoomsRes = await axios.get(`http://localhost:${PORT}/api/room/getRoom/${userId}`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        // emits 'recieve-room' to a specific client whose id is userId
        // retrieve the respective socketid from the hashmap and emits the data
        // to that socketid
        io.to(currentUser[userId]).emit("recieve-room", { result: newRoomsRes.data, body: { removed: true, by } });
      } catch (err) {}
    });

    socket.once("get-message", async ({ token, roomId }) => {
      // listens to event 'get-message' and forwards the request to a route with roomId
      try {
        const response = await axios.get(`http://localhost:${PORT}/api/chat/getChat/${roomId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // emits the event 'recieve-message' with corresponding data
        io.emit("recieve-message", { data: response.data, roomId });
      } catch (err) {}
    });

    socket.once("post-message", async ({ token, message, userId, username, roomId }: { token: string; message: string; userId: string; username: string; roomId: string }) => {
      // listens to the event 'post-message' and forward the request to a route with message, userId, username
      // and roomId
      try {
        const response = await axios.post(
          `http://localhost:${PORT}/api/chat/newMessage`,
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
        // emits 'recieve-message' with the response data
        io.emit("recieve-message", { data: response.data, roomId });
      } catch (err) {
        console.log(err);
      }
    });
  });
};

export default socketConnection;

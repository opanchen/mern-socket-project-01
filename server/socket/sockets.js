import fs from "fs";
import MessageController from "./controllers/messageController.js";
import RoomController from "./controllers/roomController.js";
import TypingController from "./controllers/typingController.js";

const sockets = (socket) => {
  const typingController = new TypingController(socket);
  const roomCotroller = new RoomController(socket);
  const messageController = new MessageController(socket);

  socket.on("send-message", messageController.sendMessage);

  socket.on("typing-started", typingController.typingStarted);

  socket.on("typing-stoped", typingController.typingStoped);

  socket.on("join-room", roomCotroller.joinRoom);

  socket.on("new-room-created", roomCotroller.newRoomCreated);

  socket.on("room-removed", roomCotroller.roomRemoved);

  socket.on("upload", ({ data, roomId }) => {
    fs.writeFile("upload" + "test.png", data, { encoding: "base64" }, () => {});
    socket.to(roomId).emit("uploaded", { buffer: data.toString("base64") });
  });

  socket.on("disconnect", (socket) => {
    console.log("User left.");
  });
};

export default sockets;

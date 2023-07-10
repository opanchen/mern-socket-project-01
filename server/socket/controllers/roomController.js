import Room from "../../models/room.js";
import BaseController from "./baseController.js";

export default class RoomController extends BaseController {
  joinRoom = ({ roomId }) => {
    this.socket.join(roomId);
  };

  newRoomCreated = ({ roomId, userId }) => {
    const room = new Room({
      name: "Test",
      roomId,
      userId,
    });
    room.save();
    this.socket.emit("new-room-created", { room });
  };

  roomRemoved = async ({ roomId }) => {
    await Room.findOneAndDelete({ roomId });
    this.socket.emit("room-removed", { roomId });
  };
}

import mongoose from "mongoose";

const { Schema } = mongoose;

const roomsSchema = new Schema({
  name: String,
  roomId: String,
  userId: String,
});

const Room = mongoose.model("room", roomsSchema);

export default Room;

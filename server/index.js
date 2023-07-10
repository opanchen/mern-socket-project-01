import express from "express";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import sockets from "./socket/sockets.js";
import router from "./api/routes.js";
import "dotenv/config.js";

const PORT = 4000;
const { DB_HOST } = process.env;

await mongoose.connect(DB_HOST);

const app = express();

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3005"],
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.use("/", router);

io.on("connection", sockets);

httpServer.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";

import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";

export const ChatWindow = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [typing, setTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const { socket } = useOutletContext();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef();

  useEffect(() => {
    if (!socket) return;

    socket.on("message-from-server", (data) => {
      setChat([...chat, { message: data.message, recieved: true }]);
    });

    socket.on("uploaded", (data) => {
      setChat([
        ...chat,
        { message: data.buffer, recieved: true, type: "image" },
      ]);
    });

    socket.on("typing-started-from-server", () => {
      setTyping(true);
    });

    socket.on("typing-stoped-from-server", () => {
      setTyping(false);
    });
  }, [chat, socket]);

  const handleForm = (e) => {
    e.preventDefault();
    socket.emit("send-message", { message, roomId });
    setChat((prevChat) => [
      ...prevChat,
      {
        message,
        recieved: false,
      },
    ]);
    setMessage("");
  };

  const handleInput = (e) => {
    setMessage(e.target.value);
    socket.emit("typing-started", { roomId });

    if (typingTimeout) clearTimeout(typingTimeout);

    setTypingTimeout(
      setTimeout(() => {
        socket.emit("typing-stoped", { roomId });
      }, 1000)
    );
  };

  const removeRoom = async () => {
    socket.emit("room-removed", { roomId });
    navigate("/");
  };

  const selectFile = () => {
    fileRef.current.click();
  };

  const fileSelected = (e) => {
    const file = e.target.files[0];

    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const data = reader.result;
      socket.emit("upload", { data, roomId });
      setChat([
        ...chat,
        { message: reader.result, recieved: false, type: "image" },
      ]);
    };
  };

  return (
    <Card
      sx={{
        padding: 2,
        marginTop: 10,
        width: "60%",
        bgcolor: "gray",
        color: "white",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        {roomId && <Typography>Room: {roomId}</Typography>}
        {roomId && (
          <Button
            size="small"
            variant="text"
            color="secondary"
            onClick={removeRoom}
          >
            Delete room
          </Button>
        )}
      </Box>

      <Box sx={{ marginBottom: 5 }}>
        {chat.map((data) =>
          data.type === "image" ? (
            <img
              style={{ float: data.recieved ? "left" : "right" }}
              key={nanoid()}
              src={data.message}
              alt="uploaded-file"
              width="100"
            />
          ) : (
            <Typography
              sx={{ textAlign: data.recieved ? "left" : "right" }}
              key={nanoid()}
            >
              {data.message}
            </Typography>
          )
        )}
      </Box>

      <Box component="form" onSubmit={handleForm}>
        {typing && (
          <InputLabel sx={{ color: "white" }} shrink htmlFor="message-input">
            Typing...
          </InputLabel>
        )}

        <OutlinedInput
          sx={{ bgcolor: "white" }}
          fullWidth
          size="small"
          id="message-input"
          placeholder="Write your message"
          value={message}
          onChange={handleInput}
          endAdornment={
            <InputAdornment position="end">
              <input
                ref={fileRef}
                onChange={fileSelected}
                type="file"
                style={{ display: "none" }}
              />

              <IconButton
                type="button"
                edge="end"
                sx={{ marginRight: 1 }}
                onClick={selectFile}
              >
                <AttachFileIcon />
              </IconButton>

              <IconButton
                type="submit"
                aria-label="send message button"
                edge="end"
              >
                <SendIcon />
              </IconButton>
            </InputAdornment>
          }
        />
      </Box>
    </Card>
  );
};

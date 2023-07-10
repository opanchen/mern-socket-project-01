import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Cookies from "js-cookies";
import { nanoid } from "nanoid";

export const Header = ({ socket, userId, setUserId }) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    if (!socket) return;

    socket.on("new-room-created", ({ room }) => {
      setRooms([...rooms, room]);
    });

    socket.on("room-removed", ({ roomId }) => {
      setRooms(rooms.filter((room) => room.roomId !== roomId));
    });
  }, [rooms, socket]);

  useEffect(() => {
    async function fetchRooms() {
      const res = await fetch("http://localhost:4000/rooms");
      const { rooms } = await res.json();
      setRooms(rooms);
    }

    fetchRooms();
  }, []);

  const createNewRoom = () => {
    const roomId = nanoid();

    navigate(`/room/${roomId}`);
    socket.emit("new-room-created", { roomId, userId });
  };

  const login = () => {
    const userId = nanoid();
    setUserId(userId);
    Cookies.setItem("userId", userId);
    navigate("/");
  };

  const logout = () => {
    setUserId(null);
    Cookies.removeItem("userId");
    navigate("/");
  };

  return (
    <Card sx={{ marginTop: 5, bgcolor: "gray" }} raised>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box>
          <Link to="/" style={{ textDecoration: "none" }}>
            <Button sx={{ color: "white" }} variant="text">
              Home
            </Button>
          </Link>

          {rooms.map((room) => {
            return (
              <Link
                key={room.roomId}
                to={`/room/${room.roomId}`}
                style={{ textDecoration: "none" }}
              >
                <Button sx={{ color: "white" }} variant="text">
                  {room.name}
                </Button>
              </Link>
            );
          })}
        </Box>

        <Box>
          {userId ? (
            <>
              <Button
                sx={{ color: "white" }}
                variant="text"
                onClick={createNewRoom}
              >
                New Room
              </Button>

              <Button sx={{ color: "white" }} variant="text" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <Button sx={{ color: "white" }} variant="text" onClick={login}>
              Login
            </Button>
          )}
        </Box>
      </Box>
    </Card>
  );
};

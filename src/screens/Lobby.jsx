import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import { v4 as uuidv4 } from "uuid";

const LobbyScreen = () => {
  const [data, setData] = useState({
    name: "",
    roomId: uuidv4(),
  });

  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();

      socket.emit("room:join", data);
    },
    [data, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { roomId } = data;
      navigate(`/room/${roomId}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);

    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);
  return (
    <div>
      <h1>Lobby</h1>
      <form onSubmit={handleSubmitForm}>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />
        <br />
        <br />

        <br />
        <br />
        <button>Join</button>
      </form>
    </div>
  );
};

export default LobbyScreen;

import logo from "./logo.svg";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import LobbyScreen from "./screens/Lobby";
import RoomScreen from "./screens/Room";
import Room2Screen from "./screens/Room2";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LobbyScreen />} />
        <Route path="/room/:roomId/:role" element={<RoomScreen />} />
        <Route path="/room2/:roomId/:role" element={<Room2Screen />} />
      </Routes>
    </div>
  );
}

export default App;

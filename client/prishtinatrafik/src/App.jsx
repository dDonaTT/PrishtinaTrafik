import { useState } from "react";
import MapView from "./features/map/MapView";
import Navbar from "./components/Navbar";
import TransportTabs from "./components/TransportTabs";

function App() {
  const [active, setActive] = useState("bus");

  return (
    <>
      <Navbar />
      <TransportTabs active={active} setActive={setActive} />
      <MapView active={active} />
    </>
  );
}

export default App;
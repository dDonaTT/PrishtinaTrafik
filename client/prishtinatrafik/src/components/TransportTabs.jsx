export default function TransportTabs({ active, setActive }) {
  const tabs = ["bus", "taxi", "bike", "scooter"];

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 flex gap-3 z-50">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActive(tab)}
          className={`px-4 py-2 rounded-full border transition
            ${active === tab ? "bg-black text-white" : "bg-white text-black border-gray-300"}
          `}
        >
          {tab.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
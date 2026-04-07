import Logo from "../assets/logo.png"
export default function Navbar() {
  return (
    <div className="fixed top-0 w-full h-16 bg-white shadow-md z-50 flex justify-between items-center px-6">
      {/* LEFT */}
      <div className="flex items-center">
        <img src={Logo} alt="logo" className="w-40 h-20" />
        <h2 className="ml-3 text-lg font-semibold">Prishtina Trafik</h2>
      </div>

      {/* RIGHT */}
      <div className="flex gap-3">
        <button className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 transition">
          Wallet
        </button>
        <button className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 transition">
          Login
        </button>
        <button className="px-3 py-1 rounded-md bg-black text-white hover:bg-gray-800 transition">
          Register
        </button>
      </div>
    </div>
  );
}
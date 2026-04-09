import { NavLink } from "react-router-dom";

import logo from "../assets/logo.svg";

function Navbar({ onLogout, isCollapsed, onToggle }) {
  const navItems = [
    { to: "/", label: "Dashboard", icon: "📊" },
    { to: "/projects", label: "Library", icon: "📚" },
  ];

  return (
    <div className={`${isCollapsed ? "w-20" : "w-64"} h-screen bg-[#1A1D2E] text-[#ABB4D2] flex flex-col transition-all duration-300 relative z-50 shadow-lg`}>
      
      {/* Toggle Button */}
      <button 
        onClick={onToggle}
        className="absolute -right-3 top-8 w-6 h-6 bg-[#556EE6] text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-[60]"
      >
        <span className="text-[10px]">{isCollapsed ? "→" : "←"}</span>
      </button>

      {/* Brand Header */}
      <div className={`p-6 pb-10 ${isCollapsed ? "flex justify-center" : ""}`}>
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="Trackbord Logo" className="w-8 h-8 object-contain shrink-0 drop-shadow-[0_0_8px_rgba(85,110,230,0.5)]" />
          {!isCollapsed && <h1 className="text-lg font-black tracking-tight uppercase text-white">Trackbord</h1>}
        </div>
        {!isCollapsed && <p className="text-[10px] font-medium text-[#74788D] uppercase tracking-widest mt-1 ml-1">Admin Dashboard</p>}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={isCollapsed ? item.label : ""}
            className={({ isActive }) =>
              `flex items-center ${isCollapsed ? "justify-center" : "gap-4 px-4"} py-3 rounded-lg font-medium text-sm transition-all duration-200 group ${
                isActive 
                  ? "bg-[#556EE6]/10 text-white" 
                  : "hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <span className={`text-lg transition-transform group-hover:scale-110 ${isCollapsed ? "" : ""}`}>{item.icon}</span>
            {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      {/* Logout / User Info */}
      <div className="p-4 border-t border-white/5 bg-black/10">
        <button 
          onClick={onLogout}
          className={`w-full flex items-center ${isCollapsed ? "justify-center" : "gap-4 px-4"} py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all`}
        >
          <span className="text-lg">🚪</span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}

export default Navbar;

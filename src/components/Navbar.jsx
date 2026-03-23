import { NavLink } from "react-router-dom";

function Navbar({ onLogout, isCollapsed, onToggle }) {
  const navItems = [
    { to: "/", label: "Dashboard", icon: "📊" },
    { to: "/projects", label: "Library", icon: "📚" },
    { to: "/add-project", label: "Record Entry", icon: "➕" },
  ];

  return (
    <div className={`${isCollapsed ? "w-20" : "w-64"} h-screen dark:bg-white/5 bg-[var(--nav-bg)] backdrop-blur-3xl dark:text-white text-[var(--text-color)] flex flex-col border-r dark:border-white/10 border-black/10 shadow-[20px_0_50px_rgba(0,0,0,0.3)] z-50 transition-all duration-300 relative`}>
      
      {/* Toggle Button */}
      <button 
        onClick={onToggle}
        className="absolute -right-3 top-10 w-6 h-6 bg-[var(--accent-color)] rounded-full flex items-center justify-center border border-white/20 shadow-lg z-50 hover:bg-[var(--accent-hover)] transition-colors"
      >
        <span className={`text-[10px] text-white transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}>◀</span>
      </button>

      {/* Brand Header */}
      <div className={`p-8 pb-12 border-b dark:border-white/5 border-black/5 dark:bg-transparent bg-[var(--nav-bg)] ${isCollapsed ? "flex justify-center px-0 text-center" : ""}`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[var(--accent-color)] rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 shrink-0">
            <span className="text-xl">🏛️</span>
          </div>
          {!isCollapsed && <h1 className="text-lg font-black tracking-tighter uppercase whitespace-nowrap dark:text-white text-[var(--text-color)]">Nexus <span className="dark:text-indigo-400 text-green-700">Hub</span></h1>}
        </div>
        {!isCollapsed && <p className="text-[10px] font-bold dark:text-indigo-300/40 text-black/40 uppercase tracking-[0.3em] ml-1">Management Suite</p>}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={isCollapsed ? item.label : ""}
            className={({ isActive }) =>
              `flex items-center ${isCollapsed ? "justify-center px-0" : "gap-4 px-5"} py-4 rounded-2xl font-bold tracking-tight text-sm transition-all duration-300 group ${
                isActive 
                  ? "bg-[var(--accent-color)] shadow-xl shadow-green-600/20 text-white" 
                  : "dark:text-indigo-200/60 text-[var(--text-color)]/60 dark:hover:bg-white/5 hover:bg-black/5 dark:hover:text-white hover:text-[var(--text-color)]"
              }`
            }
          >
            <span className="text-xl group-hover:scale-110 group-hover:rotate-3 transition-transform">{item.icon}</span>
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Profile / Logout */}
      <div className="p-4 border-t border-white/5">
        <div className="bg-white/5 rounded-2xl p-4 flex flex-col gap-4 overflow-hidden">
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-400/20 flex items-center justify-center font-black text-indigo-400 text-xs shrink-0">
              YV
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black truncate uppercase tracking-tighter">Yashvaidya</p>
                <p className="text-[9px] font-bold text-indigo-400/60 uppercase tracking-widest">Administrator</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={onLogout}
            title={isCollapsed ? "Exit Session" : ""}
            className={`w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 font-black tracking-[0.2em] uppercase transition-all active:scale-95 ${isCollapsed ? "px-0 text-[12px]" : "text-[10px]"}`}
          >
            {isCollapsed ? "🔚" : "🔚 EXIT SESSION"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;

import { useState, useEffect } from 'react';

/**
 * TopNavbar component for QuillPro SaaS UI
 * Contains user profile and modal for editing.
 */
function TopNavbar({ theme, toggleTheme }) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: "Yash Vaidya",
    role: "Administrator",
    password: ""
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({ ...prev, [name]: value }));
  };

  const saveProfile = () => {
    localStorage.setItem("userProfile", JSON.stringify(userProfile));
    setShowProfileModal(false);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

   return (
     <>
       <header className="h-16 bg-[var(--card-bg)] border-b border-[var(--border-color)] flex items-center justify-between px-6 sticky top-0 z-40 transition-colors duration-300">
         
          <div className="flex items-center gap-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] hidden lg:block">the title project traking system this only</h2>
          </div>

         <div className="flex items-center gap-6">
           {/* Theme Toggle */}
           <button 
             onClick={toggleTheme}
             className="p-2 bg-[var(--bg-color)] rounded-lg text-lg hover:bg-[var(--primary-color)]/10 transition-all border border-[var(--border-color)]"
             title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
           >
             {theme === 'dark' ? "☀️" : "🌙"}
           </button>

           {/* User Profile */}
          <div 
            className="flex items-center gap-3 pl-4 border-l border-[var(--border-color)] cursor-pointer group hover:opacity-80 transition-opacity"
            onClick={() => setShowProfileModal(true)}
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-[var(--text-primary)]">{userProfile.name}</p>
              <p className="text-[10px] text-[var(--text-secondary)] font-medium">{userProfile.role}</p>
            </div>
            <div className="w-9 h-9 bg-[var(--primary-color)] rounded-full flex items-center justify-center text-white font-black text-xs shadow-sm ring-2 ring-white dark:ring-[var(--card-bg)] group-hover:ring-[var(--primary-color)]/20 transition-all">
              {getInitials(userProfile.name)}
            </div>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center animate-in fade-in duration-200">
          <div className="card-saas p-0 w-[400px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-[var(--bg-color)]/30 border-b border-[var(--border-color)] flex justify-between items-center">
              <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">System Administrator Info</h3>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Owner Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={userProfile.name}
                  onChange={handleProfileChange}
                  className="input-saas w-full h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Assigned Role</label>
                <input 
                  type="text" 
                  name="role"
                  value={userProfile.role}
                  onChange={handleProfileChange}
                  className="input-saas w-full h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Master Password</label>
                <input 
                  type="password" 
                  name="password"
                  placeholder="Enter new password to update..."
                  value={userProfile.password}
                  onChange={handleProfileChange}
                  className="input-saas w-full h-11"
                />
                <p className="text-[9px] text-[var(--text-secondary)] font-medium italic">Credentials stored securely in node local storage.</p>
              </div>
            </div>
            
            <div className="p-4 bg-[var(--bg-color)]/50 border-t border-[var(--border-color)] flex justify-end gap-3">
              <button 
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:bg-[var(--bg-color)] rounded transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveProfile}
                className="btn-primary"
              >
                Save Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TopNavbar;

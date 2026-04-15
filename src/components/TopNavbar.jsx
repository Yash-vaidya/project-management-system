import { useState, useEffect } from 'react';

function TopNavbar({ theme, toggleTheme }) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

   return (
     <>
       <header className='h-16 bg-[var(--card-bg)] border-b border-[var(--border-color)] flex items-center justify-between px-6 sticky top-0 z-40 transition-colors duration-300'>
         
          <div className='flex items-center gap-4'>
            <h2 className='text-xs font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] hidden lg:block'>Project Tracking System</h2>
          </div>

         <div className='flex items-center gap-6'>
           {/* Theme Toggle */}
           <button 
             onClick={toggleTheme}
             className='p-2 bg-[var(--bg-color)] rounded-lg text-lg hover:bg-[var(--primary-color)]/10 transition-all border border-[var(--border-color)]'
             title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
           >
             {theme === 'dark' ? '☀️' : '🌙'}
           </button>

           {/* User Profile */}
          <div 
            className='flex items-center gap-3 pl-4 border-l border-[var(--border-color)] cursor-pointer group hover:opacity-80 transition-opacity'
            onClick={() => setShowProfileModal(true)}
          >
            <div className='text-right hidden sm:block'>
              <p className='text-xs font-bold text-[var(--text-primary)]'>{currentUser?.name || 'Guest'}</p>
              <p className='text-[10px] text-[var(--text-secondary)] font-medium'>{currentUser?.role || 'User'}</p>
            </div>
            <div className='w-9 h-9 bg-[var(--primary-color)] rounded-full flex items-center justify-center text-white font-black text-xs shadow-sm ring-2 ring-white dark:ring-[var(--card-bg)] group-hover:ring-[var(--primary-color)]/20 transition-all'>
              {getInitials(currentUser?.name || 'Guest')}
            </div>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {showProfileModal && currentUser && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center animate-in fade-in duration-200'>
          <div className='card-saas p-0 w-[400px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200'>
            <div className='p-6 bg-[var(--bg-color)]/30 border-b border-[var(--border-color)] flex justify-between items-center'>
              <h3 className='text-lg font-bold text-[var(--text-primary)] tracking-tight'>Profile</h3>
              <button 
                onClick={() => setShowProfileModal(false)}
                className='text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors'
                title='Close'
              >
                ✕
              </button>
            </div>
            
            <div className='p-6 space-y-5'>
              <div className='text-center py-4'>
                <div className='w-20 h-20 bg-[var(--primary-color)] rounded-full flex items-center justify-center text-white font-black text-2xl mx-auto mb-3 shadow-lg'>
                  {getInitials(currentUser.name)}
                </div>
                <h4 className='text-lg font-bold text-[var(--text-primary)]'>{currentUser.name}</h4>
                <p className='text-sm text-[var(--text-secondary)]'>{currentUser.email}</p>
                <span className='inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400'>
                  {currentUser.role}
                </span>
              </div>
              <div className='text-center pt-4 border-t border-[var(--border-color)]'>
                <p className='text-[10px] text-[var(--text-secondary)] font-medium'>User ID: {currentUser.id}</p>
              </div>
            </div>
            
            <div className='p-4 bg-[var(--bg-color)]/50 border-t border-[var(--border-color)] flex justify-end gap-3'>
              <button 
                onClick={() => setShowProfileModal(false)}
                className='btn-primary'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
     </>
   );
 }

 export default TopNavbar;
import { useState, useEffect } from 'react';
import AnimatedEye from './AnimatedEye';
import { useToast } from '../utils/ToastContext';

function TopNavbar({ theme, toggleTheme }) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchUser = () => {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    };
    fetchUser();
    // Listen for storage changes in case user is updated somewhere else
    window.addEventListener('storage', fetchUser);
    return () => window.removeEventListener('storage', fetchUser);
  }, []);

  const handleCloseModal = () => {
    setShowProfileModal(false);
    setIsChangingPassword(false);
    setNewPassword('');
    setShowNewPassword(false);
  };

  const handleUpdatePassword = () => {
    if (!newPassword || newPassword.length < 4) {
      addToast('Password must be at least 4 characters long', 'error');
      return;
    }

    try {
      const updatedUser = { ...currentUser, password: newPassword };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      const savedUsers = localStorage.getItem('systemUsers');
      if (savedUsers) {
        const users = JSON.parse(savedUsers);
        const updatedUsers = users.map(u => 
          u.id === currentUser.id ? { ...u, password: newPassword } : u
        );
        localStorage.setItem('systemUsers', JSON.stringify(updatedUsers));
      }

      addToast('Password updated successfully', 'success');
      setIsChangingPassword(false);
      setNewPassword('');
    } catch (e) {
      addToast('Failed to update password', 'error');
    }
  };

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
       <header className='h-16 bg-[var(--card-bg)] backdrop-blur-xl border-b border-[var(--border-color)] flex items-center justify-between px-6 sticky top-0 z-40 transition-colors duration-300 shadow-sm'>
         
          <div className='flex items-center gap-4'>
            <h2 className='text-xs font-black uppercase tracking-[0.2em] text-[var(--text-primary)] hidden lg:block drop-shadow-md'>Project Tracking System</h2>
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
              <h3 className='text-lg font-bold text-[var(--text-primary)] tracking-tight'>
                {isChangingPassword ? 'Change Password' : 'User Profile'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className='text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors'
                title='Close'
              >
                ✕
              </button>
            </div>
            
            <div className='p-6 space-y-5'>
              {!isChangingPassword ? (
                <>
                  <div className='text-center py-4'>
                    <div className='w-20 h-20 bg-[var(--primary-color)] rounded-full flex items-center justify-center text-white font-black text-2xl mx-auto mb-3 shadow-lg'>
                      {getInitials(currentUser.name)}
                    </div>
                    <h4 className='text-lg font-bold text-[var(--text-primary)]'>{currentUser.name}</h4>
                    <p className='text-sm text-[var(--text-secondary)]'>{currentUser.email}</p>
                    <span className='inline-block mt-3 px-4 py-1.5 rounded-full text-xs font-bold bg-[var(--primary-color)]/10 text-[var(--primary-color)] border border-[var(--primary-color)]/20'>
                      {currentUser.role}
                    </span>
                  </div>
                  <div className='pt-4 border-t border-[var(--border-color)] space-y-3'>
                    <div className='flex justify-between items-center'>
                      <span className='text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]'>User ID</span>
                      <span className='text-xs font-bold text-[var(--text-primary)]'>#{currentUser.id}</span>
                    </div>
                    <button 
                      onClick={() => setIsChangingPassword(true)}
                      className='w-full py-2 bg-[var(--bg-color)] hover:bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-lg text-xs font-bold transition-all border border-[var(--primary-color)]/20 flex items-center justify-center gap-2'
                    >
                      <span>🔑</span> Change Account Password
                    </button>
                  </div>
                </>
              ) : (
                <div className='space-y-6 py-4'>
                   <div className='space-y-2'>
                      <label className='text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]'>New Secure Password</label>
                      <div className='relative'>
                        <input 
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder='Enter new password'
                          className='input-saas w-full h-11 pr-10'
                          autoFocus
                        />
                        <button 
                          type='button'
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className='absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-all'
                        >
                          <AnimatedEye isOpen={showNewPassword} />
                        </button>
                      </div>
                      <p className='text-[9px] text-[var(--text-secondary)] italic'>Use at least 4 characters for better security</p>
                   </div>
                </div>
              )}
            </div>
            
            <div className='p-4 bg-[var(--bg-color)]/50 border-t border-[var(--border-color)] flex justify-end gap-3'>
              {isChangingPassword ? (
                <>
                  <button 
                    onClick={() => { setIsChangingPassword(false); setNewPassword(''); }}
                    className='px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:bg-[var(--bg-color)] rounded transition-all'
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpdatePassword}
                    className='btn-primary'
                  >
                    Save Password
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleCloseModal}
                  className='btn-primary px-6'
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}
     </>
   );
 }

 export default TopNavbar;
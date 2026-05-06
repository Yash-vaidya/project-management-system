import { useState, useEffect } from 'react';
import AnimatedEye from '../components/AnimatedEye';
import { useNavigate } from 'react-router-dom';

function Users() {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('systemUsers');
    if (saved) {
      const parsed = JSON.parse(saved);
      const migrated = parsed.map(user => {
        if (!user.role) return { ...user, role: 'User' };
        if (['Administrator','Member','Viewer'].includes(user.role)) {
          const roleMap = { 'Administrator': 'Super Admin', 'Member': 'Admin', 'Viewer': 'User' };
          return { ...user, role: roleMap[user.role] || 'User' };
        }
        return user;
      });
      localStorage.setItem('systemUsers', JSON.stringify(migrated));
      return migrated;
    }
    // Default Super Admin user - you!
    const defaultUsers = [
      { id: 1, name: 'Yash Vaidya', email: 'yash@trackbord.com', mobile: '9876543210', developer: 'Super Admin', role: 'Super Admin', password: 'admin123' },
    ];
    localStorage.setItem('systemUsers', JSON.stringify(defaultUsers));
    return defaultUsers;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  // Keep currentUser in sync across tabs
  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('currentUser');
      setCurrentUser(saved ? JSON.parse(saved) : null);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    developer: '',
    role: 'User',
    password: ''
  });

  const navigate = useNavigate();

  // Redirect if not logged in (handled by App route guard, but double-check)
  useEffect(() => {
    if (!currentUser && !localStorage.getItem('currentUser')) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Permission: only Super Admin can manage users
  const canManageUsers = currentUser?.role === 'Super Admin';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      const updatedUsers = users.map(u => 
        u.id === editingUser.id ? { ...formData, id: editingUser.id } : u
      );
      setUsers(updatedUsers);
      localStorage.setItem('systemUsers', JSON.stringify(updatedUsers));
    } else {
      const newUser = {
        ...formData,
        id: Date.now()
      };
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      localStorage.setItem('systemUsers', JSON.stringify(updatedUsers));
    }
    setShowModal(false);
    setEditingUser(null);
    setShowPassword(false);
    setFormData({ name: '', email: '', mobile: '', developer: '', role: 'Member', password: '' });
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      mobile: user.mobile || '',
      developer: user.developer || '',
      role: user.role || 'Member',
      password: user.password || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter(u => u.id !== id);
      setUsers(updatedUsers);
      localStorage.setItem('systemUsers', JSON.stringify(updatedUsers));
    }
  };

  const getInitials = (name) => {
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Super Admin': return 'bg-purple-500/20 text-purple-400';
      case 'Admin': return 'bg-blue-500/20 text-blue-400';
      case 'User': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-black text-[var(--text-primary)] tracking-tight uppercase'>User Management</h1>
            <p className='text-sm text-[var(--text-secondary)] mt-1 font-medium tracking-wide'>Manage system users and their permissions</p>
          </div>
          {canManageUsers && (
            <button 
              onClick={() => { setEditingUser(null); setFormData({ name: '', email: '', mobile: '', developer: '', role: 'User', password: '' }); setShowPassword(false); setShowModal(true); }}
              className='btn-primary flex items-center gap-2'
            >
              <span>➕</span> Add User
            </button>
          )}
        </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {users.map(user => (
          <div 
            key={user.id}
            className='card-saas p-4 flex flex-col hover:border-[var(--primary-color)]/30 transition-colors'
          >
            <div className='flex items-center gap-4 mb-4'>
              <div className='w-12 h-12 bg-[var(--primary-color)] rounded-full flex items-center justify-center text-white font-black text-sm shadow-md'>
                {getInitials(user.name)}
              </div>
              <div className='flex-1'>
                <h3 className='font-bold text-[var(--text-primary)]'>{user.name}</h3>
                <p className='text-sm text-[var(--text-secondary)]'>{user.email}</p>
                {user.mobile && <p className='text-xs text-[var(--text-secondary)]'>📱 {user.mobile}</p>}
                {user.developer && <p className='text-xs text-[var(--text-secondary)]'>💻 {user.developer}</p>}
              </div>
            </div>
             <div className='flex items-center justify-between mt-auto'>
               <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleColor(user.role)}`}>
                 {user.role}
               </span>
               {canManageUsers && (
                 <div className='flex gap-2'>
                   <button 
                     onClick={() => handleEdit(user)}
                     className='p-2 text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 rounded-lg transition-colors'
                     title='Edit'
                   >
                     ✏️
                   </button>
                   <button 
                     onClick={() => handleDelete(user.id)}
                     className='p-2 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors'
                     title='Delete'
                   >
                     🗑️
                   </button>
                 </div>
               )}
             </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className='text-center py-12'>
          <p className='text-[var(--text-secondary)] font-medium'>No users found. Add your first user!</p>
        </div>
      )}

      {showModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center animate-in fade-in duration-200'>
          <div className='card-saas p-0 w-[450px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200'>
            <div className='p-6 bg-[var(--bg-color)]/30 border-b border-[var(--border-color)] flex justify-between items-center'>
              <h3 className='text-lg font-bold text-[var(--text-primary)] tracking-tight'>
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button 
                onClick={() => { setShowModal(false); setEditingUser(null); setShowPassword(false); }}
                className='text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-xl'
              >
                ✕
              </button>
            </div>
            
             <form onSubmit={handleSubmit} className='p-6 space-y-5'>
               <div className='space-y-2'>
                 <label className='text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]'>Full Name *</label>
                 <input 
                   type='text' 
                   name='name'
                   value={formData.name}
                   onChange={handleInputChange}
                   required
                   className='input-saas w-full h-11'
                   placeholder='Enter full name'
                 />
               </div>
               <div className='space-y-2'>
                 <label className='text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]'>Mobile Number *</label>
                 <input 
                   type='tel' 
                   name='mobile'
                   value={formData.mobile}
                   onChange={handleInputChange}
                   required
                   className='input-saas w-full h-11'
                   placeholder='Enter mobile number'
                 />
               </div>
               <div className='space-y-2'>
                 <label className='text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]'>Email</label>
                 <input 
                   type='email' 
                   name='email'
                   value={formData.email}
                   onChange={handleInputChange}
                   className='input-saas w-full h-11'
                   placeholder='Enter email address (optional)'
                 />
               </div>
               <div className='space-y-2'>
                 <label className='text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]'>Developer / Role</label>
                 <input 
                   type='text' 
                   name='developer'
                   value={formData.developer}
                   onChange={handleInputChange}
                   className='input-saas w-full h-11'
                   placeholder='e.g., Frontend, Backend, Full Stack (optional)'
                 />
               </div>
                <div className='space-y-2'>
                  <label className='text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]'>Role</label>
                  <select 
                    name='role'
                    value={formData.role}
                    onChange={handleInputChange}
                    className='input-saas w-full h-11'
                  >
                    <option value='Super Admin'>Super Admin</option>
                    <option value='Admin'>Admin</option>
                    <option value='User'>User</option>
                  </select>
                </div>
               <div className='space-y-2'>
                 <label className='text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]'>
                   {editingUser ? 'New Password' : 'Password'}
                 </label>
                 <div className='relative'>
                   <input 
                     type={showPassword ? 'text' : 'password'} 
                     name='password'
                     value={formData.password}
                     onChange={handleInputChange}
                     required={!editingUser}
                     className='input-saas w-full h-11 pr-10'
                     placeholder={editingUser ? 'Leave empty to keep current' : 'Enter password'}
                   />
                   <button
                     type='button'
                     onClick={() => setShowPassword(!showPassword)}
                     className='absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-all'
                     title={showPassword ? 'Hide Password' : 'Show Password'}
                   >
                     <AnimatedEye isOpen={showPassword} />
                   </button>
                 </div>
               </div>
             </form>
            
            <div className='p-4 bg-[var(--bg-color)]/50 border-t border-[var(--border-color)] flex justify-end gap-3'>
              <button 
                type='button'
                onClick={() => { setShowModal(false); setEditingUser(null); setShowPassword(false); }}
                className='px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:bg-[var(--bg-color)] rounded transition-colors'
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                className='btn-primary'
              >
                {editingUser ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
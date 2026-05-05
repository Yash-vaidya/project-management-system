import { useState, useEffect } from 'react';
import AnimatedEye from '../components/AnimatedEye';

function Users() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Member',
    password: ''
  });

  useEffect(() => {
    const savedUsers = localStorage.getItem('systemUsers');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      const defaultUsers = [
        { id: 1, name: 'Yash Vaidya', email: 'yashvaidya9623@gmail.com', role: 'Administrator', password: '9056' }
      ];
      setUsers(defaultUsers);
      localStorage.setItem('systemUsers', JSON.stringify(defaultUsers));
    }
  }, []);

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
    setFormData({ name: '', email: '', role: 'Member', password: '' });
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData(user);
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
      case 'Administrator': return 'bg-purple-500/20 text-purple-400';
      case 'Member': return 'bg-blue-500/20 text-blue-400';
      case 'Viewer': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-black text-[var(--text-primary)] tracking-tight'>User Management</h1>
          <p className='text-sm text-[var(--text-secondary)] font-medium mt-1'>Manage system users and their permissions</p>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setFormData({ name: '', email: '', role: 'Member', password: '' }); setShowPassword(false); setShowModal(true); }}
          className='btn-primary flex items-center gap-2'
        >
          <span>➕</span> Add User
        </button>
      </div>

      <div className='grid gap-4'>
        {users.map(user => (
          <div 
            key={user.id}
            className='card-saas p-4 flex items-center justify-between hover:border-[var(--primary-color)]/30 transition-colors'
          >
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 bg-[var(--primary-color)] rounded-full flex items-center justify-center text-white font-black text-sm shadow-md'>
                {getInitials(user.name)}
              </div>
              <div>
                <h3 className='font-bold text-[var(--text-primary)]'>{user.name}</h3>
                <p className='text-sm text-[var(--text-secondary)]'>{user.email}</p>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleColor(user.role)}`}>
                {user.role}
              </span>
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
                <label className='text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]'>Full Name</label>
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
                <label className='text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]'>Email</label>
                <input 
                  type='email' 
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className='input-saas w-full h-11'
                  placeholder='Enter email address'
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
                  <option value='Administrator'>Administrator</option>
                  <option value='Member'>Member</option>
                  <option value='Viewer'>Viewer</option>
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
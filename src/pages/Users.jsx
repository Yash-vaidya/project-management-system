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
    developerPositions: [],
    password: ''
  });

  useEffect(() => {
    const savedUsers = localStorage.getItem('systemUsers');

    if (savedUsers) {
      const parsed = JSON.parse(savedUsers);

      const usersWithPosition = parsed.map(user => ({
        ...user,
        developerPosition: Array.isArray(user.developerPosition)
          ? user.developerPosition
          : user.developerPosition
          ? [user.developerPosition]
          : []
      }));

      setUsers(usersWithPosition);
    } else {
      const defaultUsers = [
        {
          id: 1,
          name: 'Yash Vaidya',
          email: 'yashvaidya9623@gmail.com',
          role: 'Administrator',
          password: '9056',
          developerPosition: ['Super Admin']
        }
      ];

      setUsers(defaultUsers);
      localStorage.setItem('systemUsers', JSON.stringify(defaultUsers));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => {
        const current = prev[name] || [];

        if (checked) {
          return {
            ...prev,
            [name]: [...current, value]
          };
        }

        return {
          ...prev,
          [name]: current.filter(item => item !== value)
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingUser) {
      const updatedUsers = users.map(user =>
        user.id === editingUser.id
          ? {
              ...formData,
              developerPosition: formData.developerPositions,
              id: editingUser.id
            }
          : user
      );

      setUsers(updatedUsers);
      localStorage.setItem('systemUsers', JSON.stringify(updatedUsers));
    } else {
      const newUser = {
        ...formData,
        developerPosition: formData.developerPositions,
        id: Date.now()
      };

      const updatedUsers = [...users, newUser];

      setUsers(updatedUsers);
      localStorage.setItem('systemUsers', JSON.stringify(updatedUsers));
    }

    setShowModal(false);
    setEditingUser(null);
    setShowPassword(false);

    setFormData({
      name: '',
      email: '',
      role: 'Member',
      developerPositions: [],
      password: ''
    });
  };

  const handleEdit = (user) => {
    setEditingUser(user);

    const developerPositions = Array.isArray(user.developerPosition)
      ? user.developerPosition
      : user.developerPosition
      ? [user.developerPosition]
      : [];

    setFormData({
      ...user,
      developerPositions
    });

    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter(user => user.id !== id);

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

  return (
    <div className='space-y-6'>

      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-black text-[var(--text-primary)]'>
            User Management
          </h1>

          <p className='text-sm text-[var(--text-secondary)] mt-1'>
            Manage system users and teams
          </p>
        </div>

        <button
          onClick={() => {
            setEditingUser(null);

            setFormData({
              name: '',
              email: '',
              role: 'Member',
              developerPositions: [],
              password: ''
            });

            setShowPassword(false);
            setShowModal(true);
          }}
          className='btn-primary flex items-center gap-2'
        >
          ➕ Add User
        </button>
      </div>

      {/* Developer Teams */}
      <div className='space-y-4'>

        {/* Horizontal Scroll */}
        <div className='overflow-x-auto pb-4'>

          <div className='flex gap-5 min-w-max'>

            {/* Dot Net Developers */}
            <div className='card-saas p-4 w-[320px] min-w-[320px] max-h-[650px] overflow-y-auto flex flex-col'>
              <h2 className='text-lg font-bold mb-4 text-blue-400 sticky top-0 bg-[var(--card-bg)] z-10 pb-2'>
                Dot Net Developers
              </h2>

              <div className='space-y-3'>
                {users
                  .filter(user =>
                    user.developerPosition?.includes('Dot Net Developer')
                  )
                  .map(user => (
                    <UserCard
                      key={user.id}
                      user={user}
                      color='bg-blue-500'
                      getInitials={getInitials}
                      handleEdit={handleEdit}
                      handleDelete={handleDelete}
                    />
                  ))}
              </div>
            </div>

            {/* Backend Developers */}
            <div className='card-saas p-4 w-[320px] min-w-[320px] max-h-[650px] overflow-y-auto flex flex-col'>
              <h2 className='text-lg font-bold mb-4 text-green-400 sticky top-0 bg-[var(--card-bg)] z-10 pb-2'>
                Backend Developers
              </h2>

              <div className='space-y-3'>
                {users
                  .filter(user =>
                    user.developerPosition?.includes('Backend Developer')
                  )
                  .map(user => (
                    <UserCard
                      key={user.id}
                      user={user}
                      color='bg-green-500'
                      getInitials={getInitials}
                      handleEdit={handleEdit}
                      handleDelete={handleDelete}
                    />
                  ))}
              </div>
            </div>

            {/* Frontend Developers */}
            <div className='card-saas p-4 w-[320px] min-w-[320px] max-h-[650px] overflow-y-auto flex flex-col'>
              <h2 className='text-lg font-bold mb-4 text-pink-400 sticky top-0 bg-[var(--card-bg)] z-10 pb-2'>
                Frontend Developers
              </h2>

              <div className='space-y-3'>
                {users
                  .filter(user =>
                    user.developerPosition?.includes('Frontend Developer')
                  )
                  .map(user => (
                    <UserCard
                      key={user.id}
                      user={user}
                      color='bg-pink-500'
                      getInitials={getInitials}
                      handleEdit={handleEdit}
                      handleDelete={handleDelete}
                    />
                  ))}
              </div>
            </div>

            {/* Mobile Developers */}
            <div className='card-saas p-4 w-[320px] min-w-[320px] max-h-[650px] overflow-y-auto flex flex-col'>
              <h2 className='text-lg font-bold mb-4 text-orange-400 sticky top-0 bg-[var(--card-bg)] z-10 pb-2'>
                Mobile Developers
              </h2>

              <div className='space-y-3'>
                {users
                  .filter(user =>
                    user.developerPosition?.includes('Android Developer')
                  )
                  .map(user => (
                    <UserCard
                      key={user.id}
                      user={user}
                      color='bg-orange-500'
                      getInitials={getInitials}
                      handleEdit={handleEdit}
                      handleDelete={handleDelete}
                    />
                  ))}
              </div>
            </div>

            {/* QA / UI Team */}
            <div className='card-saas p-4 w-[320px] min-w-[320px] max-h-[650px] overflow-y-auto flex flex-col'>
              <h2 className='text-lg font-bold mb-4 text-purple-400 sticky top-0 bg-[var(--card-bg)] z-10 pb-2'>
                QA / UI Team
              </h2>

              <div className='space-y-3'>
                {users
                  .filter(
                    user =>
                      user.developerPosition?.includes('Tester') ||
                      user.developerPosition?.includes('UI Designer')
                  )
                  .map(user => (
                    <UserCard
                      key={user.id}
                      user={user}
                      color='bg-purple-500'
                      getInitials={getInitials}
                      handleEdit={handleEdit}
                      handleDelete={handleDelete}
                    />
                  ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>

          <div className='card-saas w-[450px] p-6 max-h-[90vh] overflow-y-auto'>

            <div className='flex justify-between items-center mb-5'>
              <h2 className='text-xl font-bold'>
                {editingUser ? 'Edit User' : 'Add User'}
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className='text-xl'
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className='space-y-4'>

              <input
                type='text'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                placeholder='Full Name'
                className='input-saas w-full'
                required
              />

              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleInputChange}
                placeholder='Email'
                className='input-saas w-full'
                required
              />

              <select
                name='role'
                value={formData.role}
                onChange={handleInputChange}
                className='input-saas w-full'
              >
                <option value='Administrator'>Administrator</option>
                <option value='Developer'>Developer</option>
                <option value='Member'>Member</option>
                <option value='Viewer'>Viewer</option>
              </select>

              <div className='space-y-2'>

                <label className='font-semibold text-[var(--text-primary)]'>
                  Developer Positions
                </label>

                {[
                  'Super Admin',
                  'Dot Net Developer',
                  'Backend Developer',
                  'Frontend Developer',
                  'Android Developer',
                  'Tester',
                  'UI Designer'
                ].map(position => (
                  <label
                    key={position}
                    className='flex items-center gap-2 text-sm'
                  >
                    <input
                      type='checkbox'
                      name='developerPositions'
                      value={position}
                      checked={formData.developerPositions.includes(position)}
                      onChange={handleInputChange}
                    />

                    {position}
                  </label>
                ))}
              </div>

              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder='Password'
                  className='input-saas w-full pr-10'
                  required={!editingUser}
                />

                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2'
                >
                  <AnimatedEye isOpen={showPassword} />
                </button>
              </div>

              <button
                type='submit'
                className='btn-primary w-full'
              >
                {editingUser ? 'Update User' : 'Create User'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* User Card */
function UserCard({
  user,
  color,
  getInitials,
  handleEdit,
  handleDelete
}) {
  return (
    <div className='p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] overflow-hidden'>

      <div className='flex items-start justify-between gap-3'>

        <div className='flex items-start gap-3 flex-1 min-w-0'>

          <div
            className={`w-10 h-10 min-w-[40px] rounded-full ${color} flex items-center justify-center text-white font-bold`}
          >
            {getInitials(user.name)}
          </div>

          <div className='flex-1 min-w-0 overflow-hidden'>

            <h3 className='font-semibold text-[var(--text-primary)] truncate'>
              {user.name}
            </h3>

            <p className='text-xs text-[var(--text-secondary)] break-all'>
              {user.email}
            </p>

            <div className='flex flex-wrap gap-1 mt-2'>
              {user.developerPosition?.map((position, index) => (
                <span
                  key={index}
                  className='px-2 py-1 rounded-full text-[10px] bg-[var(--primary-color)]/20 text-[var(--primary-color)] break-words'
                >
                  {position}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-2 shrink-0'>

          <button
            onClick={() => handleEdit(user)}
            className='p-1 hover:bg-[var(--primary-color)]/10 rounded transition'
          >
            ✏️
          </button>

          <button
            onClick={() => handleDelete(user.id)}
            className='p-1 hover:bg-red-500/10 rounded transition'
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

export default Users;
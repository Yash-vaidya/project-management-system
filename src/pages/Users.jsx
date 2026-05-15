import { useState, useEffect } from 'react';
import AnimatedEye from '../components/AnimatedEye';
import { allPermissions, permissionCategories } from '../context/PermissionsContext';

function Users() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  /* Current logged-in user — read from localStorage */
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('currentUser') || '{}');
    } catch { return {}; }
  })();

  /* Only a real Administrator can change others' profiles */
  const isGlobalAdmin = currentUser.role === 'Administrator';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Member',
    developerPositions: [],
    password: '',
    permissions: []
  });

  /* Load Users */
  useEffect(() => {
    const savedUsers = localStorage.getItem('systemUsers');

    if (savedUsers) {
      try {
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
      } catch (error) {
        console.error('Error parsing users:', error);
      }
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

  /* Input Change */
  const handleInputChange = e => {
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

  /* Submit */
  const handleSubmit = e => {
    e.preventDefault();

    if (editingUser) {
      const updatedUsers = users.map(user =>
        user.id === editingUser.id
          ? {
              ...formData,
              developerPosition: formData.developerPositions,
              permissions: formData.permissions,
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
        permissions: formData.permissions,
        id: Date.now()
      };

      const updatedUsers = [...users, newUser];

      setUsers(updatedUsers);
      localStorage.setItem('systemUsers', JSON.stringify(updatedUsers));
    }

    resetForm();
  };

  /* Reset Form */
  const resetForm = () => {
    setShowModal(false);
    setEditingUser(null);
    setShowPassword(false);

    setFormData({
      name: '',
      email: '',
      role: 'Member',
      developerPositions: [],
      password: '',
      permissions: []
    });
  };

  /* Edit */
  const handleEdit = user => {
    setEditingUser(user);

    const developerPositions = Array.isArray(user.developerPosition)
      ? user.developerPosition
      : user.developerPosition
      ? [user.developerPosition]
      : [];

    const userPermissions = user.permissions
      ? (Array.isArray(user.permissions) ? user.permissions : [])
      : [];

    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'Member',
      password: user.password || '',
      developerPositions,
      permissions: userPermissions,
    });

    setShowModal(true);
  };

  /* Delete */
  const handleDelete = id => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this user?'
    );

    if (confirmDelete) {
      const updatedUsers = users.filter(user => user.id !== id);

      setUsers(updatedUsers);
      localStorage.setItem('systemUsers', JSON.stringify(updatedUsers));
    }
  };

  /* Initials */
  const getInitials = name => {
    if (!name) return 'U';

    const parts = name.trim().split(' ');

    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    return parts[0][0].toUpperCase();
  };

  /* Add User */
  const openAddUserModal = () => {
    setEditingUser(null);
    resetForm();
    setShowModal(true);
  };

  const developerGroups = [
    {
      title: 'Dot Net Developers',
      color: 'bg-blue-500',
      textColor: 'text-blue-400',
      filter: 'Dot Net Developer'
    },
    {
      title: 'Backend Developers',
      color: 'bg-green-500',
      textColor: 'text-green-400',
      filter: 'Backend Developer'
    },
    {
      title: 'Frontend Developers',
      color: 'bg-pink-500',
      textColor: 'text-pink-400',
      filter: 'Frontend Developer'
    },
    {
      title: 'Mobile Developers',
      color: 'bg-orange-500',
      textColor: 'text-orange-400',
      filter: 'Android Developer'
    }
  ];

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

        <div className='flex items-center gap-3'>
          {isGlobalAdmin && (
            <button
              onClick={openAddUserModal}
              className='btn-secondary flex items-center gap-2'
            >
              ➕ Add User
            </button>
          )}
        </div>
      </div>

      {/* Teams */}
      <div className='overflow-x-auto pb-4'>
        <div className='flex gap-5 min-w-max'>
          {developerGroups.map(group => (
            <div
              key={group.title}
              className='card-saas p-4 w-[320px] min-w-[320px] max-h-[650px] overflow-y-auto flex flex-col'
            >
              <h2
                className={`text-lg font-bold mb-4 sticky top-0 bg-[var(--card-bg)] z-10 pb-2 ${group.textColor}`}
              >
                {group.title}
              </h2>

              <div className='space-y-3'>
                {users
                  .filter(user =>
                    user.developerPosition?.includes(group.filter)
                  )
                  .map(user => (
                    <UserCard
                      key={user.id}
                      user={user}
                      color={group.color}
                      getInitials={getInitials}
                      handleEdit={handleEdit}
                      handleDelete={handleDelete}
                      currentUserId={currentUser.id}
                      isGlobalAdmin={isGlobalAdmin}
                    />
                  ))}
              </div>
            </div>
          ))}

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
                <option value='Administrator'>
                  Administrator
                </option>
                <option value='Developer'>Developer</option>
                <option value='Member'>Member</option>
                <option value='Viewer'>Viewer</option>
              </select>

               {/* Developer Positions */}
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
                       checked={formData.developerPositions.includes(
                         position
                       )}
                       onChange={handleInputChange}
                     />

                     {position}
                   </label>
                 ))}
                </div>

                {/* Permissions Module — Admin only */}
                {isGlobalAdmin && (
                <div className='space-y-3 pt-4 border-t border-[var(--border-color)]'>
                  <div className='flex items-center justify-between'>
                    <label className='font-black text-[10px] uppercase tracking-wider text-[var(--text-secondary)]'>
                      Permissions Module
                    </label>
                    <span className='text-[9px] text-[var(--text-secondary)] italic'>
                      {formData.permissions.length} enabled
                    </span>
                  </div>

                  <div className='space-y-3'>
                    {permissionCategories.map(cat => {
                      const catPerms = cat.permissions;
                      const anyInCategory = catPerms.some(
                        p => formData.permissions.includes(p)
                      );

                      return (
                        <div key={cat.key} className='rounded-xl border border-[var(--border-color)] overflow-hidden'>
                          <button
                            type='button'
                            onClick={() => {
                              const next = [...formData.permissions];
                              if (anyInCategory) {
                                catPerms.forEach(p => {
                                  const idx = next.indexOf(p);
                                  if (idx > -1) next.splice(idx, 1);
                                });
                              } else {
                                catPerms.forEach(p => {
                                  if (!next.includes(p)) next.push(p);
                                });
                              }
                              setFormData(prev => ({ ...prev, permissions: next }));
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all ${
                              anyInCategory
                                ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)]'
                                : 'bg-[var(--bg-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-color)]/60'
                            }`}
                          >
                            <span className='flex items-center gap-2'>
                              <span>{cat.icon}</span>
                              <span>{cat.label}</span>
                            </span>
                            <span className='text-[var(--text-secondary)]'>
                              {anyInCategory ? '▼' : '▶'}
                            </span>
                          </button>

                          {anyInCategory && (
                            <div className='border-t border-[var(--border-color)] bg-[var(--bg-color)]/30 p-3 grid grid-cols-1 gap-1.5'>
                              {catPerms.map(p => {
                                const def = allPermissions[p];
                                if (!def) return null;
                                const checked = formData.permissions.includes(p);
                                return (
                                  <label
                                    key={p}
                                    className='flex items-center gap-2 text-[10px] cursor-pointer'
                                  >
                                    <input
                                      type='checkbox'
                                      checked={checked}
                                      onChange={() => {
                                        const next = [...formData.permissions];
                                        if (checked) {
                                          const idx = next.indexOf(p);
                                          if (idx > -1) next.splice(idx, 1);
                                        } else if (!next.includes(p)) {
                                          next.push(p);
                                        }
                                        setFormData(prev => ({ ...prev, permissions: next }));
                                      }}
                                      className='w-3.5 h-3.5 accent-[var(--primary-color)]'
                                    />
                                    <span className={checked ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]'}>
                                      {def.label}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                </div>
                )}

               {/* Password */}
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
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className='absolute right-3 top-1/2 -translate-y-1/2'
                >
                  <AnimatedEye isOpen={showPassword} />
                </button>
              </div>

              <button
                type='submit'
                className='btn-primary w-full'
              >
                {editingUser
                  ? 'Update User'
                  : 'Create User'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* User Card Component */
function UserCard({
  user,
  color,
  getInitials,
  handleEdit,
  handleDelete,
  currentUserId,
  isGlobalAdmin
}) {
  // Only admins see both buttons on everyone.
  // Non-admins: can only edit their own profile; delete is hidden entirely.
  const canEdit = isGlobalAdmin || user.id === currentUserId;
  const canDelete = isGlobalAdmin;

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
              {user.developerPosition?.map(
                (position, index) => (
                  <span
                    key={index}
                    className='px-2 py-1 rounded-full text-[10px] bg-[var(--primary-color)]/20 text-[var(--primary-color)] break-words'
                  >
                    {position}
                  </span>
                )
              )}

              {user.role && (
                <span
                  className='px-2 py-1 rounded-full text-[10px] bg-[var(--warning)]/15 text-[var(--warning)] break-words font-bold uppercase tracking-wider'
                >
                  {user.role}
                </span>
              )}
            </div>
          </div>
        </div>

        {(canEdit || canDelete) && (
          <div className='flex flex-col gap-2 shrink-0'>
            {canEdit && (
              <button
                onClick={() => handleEdit(user)}
                className='p-1 hover:bg-[var(--primary-color)]/10 rounded transition'
                title={isGlobalAdmin ? `Edit ${user.name}` : 'Edit your profile'}
              >
                ✏️
              </button>
            )}

            {canDelete && (
              <button
                onClick={() => handleDelete(user.id)}
                className='p-1 hover:bg-red-500/10 rounded transition'
                title={`Delete ${user.name}`}
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;
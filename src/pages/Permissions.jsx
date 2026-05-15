import { useState, useEffect, useMemo, useCallback } from 'react';
import { allPermissions, defaultRolePermissions, permissionCategories } from '../context/PermissionsContext';

// ─── Pure helpers (no React hook calls) ─────────────────────────────────────

function resolvePermissions(user) {
  if (!user) return [];
  if (user.permissions && Array.isArray(user.permissions)) return user.permissions;
  if (user.role && defaultRolePermissions[user.role]) return [...defaultRolePermissions[user.role]];
  return [...defaultRolePermissions.Member];
}

function buildPermOps(user) {
  const list = resolvePermissions(user);

  return {
    can:         (k)  => list.includes(k),
    permList:    ()   => [...list],
    revoke:      (k)  => list.filter(x => x !== k),
    resetToRole: ()   => [...defaultRolePermissions[user?.role || 'Member']],
  };
}

const ALL_KEYS = Object.keys(allPermissions);

function Permissions() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);

  /* Load all users — runs once on mount */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('systemUsers') || '[]');
    setUsers(saved);

    /* Keep in sync if users are edited from another tab or the Users page */
    const sync = () => {
      const cur = JSON.parse(localStorage.getItem('systemUsers') || '[]');
      setUsers(cur);
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  /* Filtered user list */
  const usersForQuery = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      u => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
    );
  }, [users, search]);

  /* Currently selected user */
  const selectedUser = useMemo(
    () => users.find(u => u.id === selectedUserId) || null,
    [users, selectedUserId]
  );

  /* Effective permission keys for selected user */
  const activeKeys = useMemo(
    () => resolvePermissions(selectedUser),
    [selectedUser]
  );

  /* ── Handlers ───────────────────────────────────────────────────────────── */

  const savePermissions = useCallback((permArray) => {
    if (!selectedUser) return;
    const updated = users.map(u =>
      u.id === selectedUser.id ? { ...u, permissions: permArray } : u
    );
    setUsers(updated);
    localStorage.setItem('systemUsers', JSON.stringify(updated));
    showToast('Permissions saved');
  }, [users, selectedUser]);

  const togglePerm = useCallback((key) => {
    const isOn = activeKeys.includes(key);
    const next = isOn
      ? activeKeys.filter(k => k !== key)
      : [...activeKeys, key];
    savePermissions(next);
  }, [activeKeys, savePermissions]);

  const toggleCategory = useCallback((keys) => {
    const anyOn = keys.some(k => activeKeys.includes(k));
    const next = anyOn
      ? activeKeys.filter(k => !keys.includes(k))
      : [...new Set([...activeKeys, ...keys])];
    savePermissions(next);
  }, [activeKeys, savePermissions]);

  function resetToRole() {
    if (!selectedUser) return;
    const defaults = [...defaultRolePermissions[selectedUser.role || 'Member']];
    savePermissions(defaults);
    showToast('Reset to role defaults');
  }

  function showToast(msg) {
    const el = Object.assign(document.createElement('div'), {
      textContent: msg,
      style:
        'position:fixed;bottom:20px;right:20px;background:#556EE6;color:#fff;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.05em;padding:8px 20px;border-radius:12px;z-index:99999;box-shadow:0 8px 32px rgba(0,0,0,.3);',
    });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  }

  /* ── Render ─────────────────────────────────────────────────────────────── */

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-black text-[var(--text-primary)]'>Permissions Module</h1>
        <p className='text-sm text-[var(--text-secondary)] mt-1'>
          View and manage permissions for every user in the system.
        </p>
      </div>

      {/* Search bar */}
      <div className='card-saas p-4'>
        <input
          type='text'
          placeholder='Search user by name or email…'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='input-saas w-full'
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* ── Left: user list ─────────────────────────────────────────────── */}
        <div className='lg:col-span-1 space-y-3'>
          <h2 className='text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]'>
            Users ({usersForQuery.length})
          </h2>
          <div className='space-y-2 max-h-[calc(100vh-260px)] overflow-y-auto pr-1'>
            {usersForQuery.length === 0 && (
              <div className='text-center text-[var(--text-secondary)] text-sm py-8 opacity-50'>
                No users found
              </div>
            )}
            {usersForQuery.map(user => {
              const uPerms = user.permissions?.length || 0;
              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`w-full card-saas p-4 text-left transition-all ${
                    selectedUserId === user.id
                      ? 'ring-2 ring-[var(--primary-color)] bg-[var(--primary-color)]/5'
                      : 'hover:bg-[var(--bg-color)]/60'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <div className='w-9 h-9 min-w-[36px] rounded-full bg-[var(--primary-color)]/15 text-[var(--primary-color)] flex items-center justify-center font-black text-[10px]'>
                      {(user.name || 'U').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='font-bold text-sm text-[var(--text-primary)] truncate'>{user.name || 'Unknown'}</p>
                      <p className='text-[10px] text-[var(--text-secondary)] truncate'>{user.email || '—'}</p>
                      <div className='flex items-center gap-2 mt-1'>
                        <span className='text-[9px] font-black uppercase text-[var(--text-secondary)]'>
                          {user.role || 'Member'}
                        </span>
                        <span className='text-[9px] text-[var(--text-secondary)] opacity-50'>
                          · {uPerms} perms
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right: permission editor ────────────────────────────────────── */}
        <div className='lg:col-span-2'>
          {!selectedUser ? (
            <div className='card-saas p-12 text-center text-[var(--text-secondary)] opacity-60'>
              <p className='text-5xl mb-3'>🔐</p>
              <p className='text-sm'>Select a user from the list to view and edit their permissions.</p>
            </div>
          ) : (
            <div className='card-saas p-6 space-y-5'>
              {/* User info bar */}
              <div className='flex items-center justify-between pb-4 border-b border-[var(--border-color)]'>
                <div>
                  <h2 className='text-lg font-bold text-[var(--text-primary)]'>{selectedUser.name}</h2>
                  <p className='text-xs text-[var(--text-secondary)]'>{selectedUser.email}</p>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='px-3 py-1 rounded-full text-[10px] font-black uppercase bg-[var(--primary-color)]/10 text-[var(--primary-color)]'>
                    {selectedUser.role}
                  </span>
                  <button
                    onClick={resetToRole}
                    className='text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-[var(--bg-color)] text-[var(--text-secondary)] hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)] transition-all'
                  >
                    ↺ Reset Role Defaults
                  </button>
                </div>
              </div>

              {/* Category accordions */}
              <div className='space-y-3'>
                {permissionCategories.map(cat => {
                  const keys = cat.permissions;
                  const onCount = keys.filter(k => activeKeys.includes(k)).length;
                  const allOn  = keys.length > 0 && keys.every(k => activeKeys.includes(k));
                  const someOn = keys.some(k => activeKeys.includes(k));

                  return (
                    <div key={cat.key} className='rounded-xl border border-[var(--border-color)] overflow-hidden'>
                      {/* Category header button */}
                      <button
                        onClick={() => toggleCategory(keys)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-[10px] font-black uppercase tracking-wider transition-colors ${
                          allOn
                            ? 'bg-[var(--primary-color)]/15 text-[var(--primary-color)]'
                            : someOn
                              ? 'bg-[var(--primary-color)]/5  text-[var(--text-primary)]'
                              : 'bg-[var(--bg-color)]          text-[var(--text-secondary)] hover:bg-[var(--bg-color)]/60'
                        }`}
                      >
                        <span className='flex items-center gap-2'>
                          <span className='text-base'>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </span>
                        <span className='flex items-center gap-3'>
                          <span className={`text-[9px] ${someOn ? 'opacity-100' : 'opacity-40'}`}>
                            {onCount}/{keys.length}
                          </span>
                          <span>{someOn ? '▼' : '▶'}</span>
                        </span>
                      </button>

                      {/* Individual checkboxes */}
                      <div className='border-t border-[var(--border-color)] bg-[var(--bg-color)]/30 p-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1'>
                        {keys.map(k => {
                          const def = allPermissions[k];
                          if (!def) return null;
                          const checked = activeKeys.includes(k);
                          return (
                            <label
                              key={k}
                              className='flex items-center gap-2.5 text-[10px] cursor-pointer py-1'
                            >
                              <input
                                type='checkbox'
                                checked={checked}
                                onChange={() => togglePerm(k)}
                                className='w-3.5 h-3.5 accent-[var(--primary-color)] shrink-0'
                              />
                              <span className={checked
                                ? 'text-[var(--text-primary)] font-medium'
                                : 'text-[var(--text-secondary)]'
                              }>
                                {def.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className='pt-4 border-t border-[var(--border-color)] flex items-center justify-between text-[10px]'>
                <span className='text-[var(--text-secondary)]'>
                  {activeKeys.length} permissions enabled
                </span>
                <button
                  onClick={() => {
                    savePermissions(ALL_KEYS);
                    showToast(`All ${ALL_KEYS.length} permissions granted`);
                  }}
                  className='text-[var(--primary-color)] font-black hover:underline'
                >
                  ✦ Grant All Permissions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Permissions;

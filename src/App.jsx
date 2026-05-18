import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Home from './pages/Home';
import Projects from './pages/Projects';
import AddProject from './pages/AddProject';
import Navbar from './components/Navbar';
import TopNavbar from './components/TopNavbar';
import ProjectDetails from './pages/ProjectDetails';
import Users from './pages/Users';
import Permissions from './pages/Permissions';
import { SUPER_ROLES, VALID_ROLES } from './context/PermissionsContext';
import { ToastProvider } from './utils/ToastContext';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  /* ── Track currentUser from localStorage (kept fresh via storage events) ── */
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('currentUser') || '{}');
    } catch { return {}; }
  });

  useEffect(() => {
    const sync = () => {
      try {
        setCurrentUser(JSON.parse(localStorage.getItem('currentUser') || '{}'));
      } catch { setCurrentUser({}); }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  /* Super Admin = either role is in SUPER_ROLES */
  const isSuperAdmin = SUPER_ROLES.includes(currentUser.role);

  /* Fallback guard: block any malformed/injected role */
  const isRoleValid = VALID_ROLES.includes(currentUser.role);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = (e) => {
      const target = e.target === document ? document.documentElement : e.target;
      if (target && target.scrollTop !== undefined) {
         if (target.scrollTop > 150) {
           setShowScrollTop(true);
           window._activeScrollPath = target;
         } else if (target === window._activeScrollPath && target.scrollTop <= 150) {
           setShowScrollTop(false);
         }
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);

  const scrollToTop = () => {
    if (window._activeScrollPath && typeof window._activeScrollPath.scrollTo === 'function') {
      window._activeScrollPath.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const viewport = document.getElementById('main-viewport');
      if (viewport) {
        viewport.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  /**
   * handleLogin — writes currentUser to localStorage BEFORE calling onLogin so the
   * Navbar / Permissions route see the up-to-date role on the very next render.
   */
  const handleLogin = (status) => {
    setIsLoggedIn(status);
    localStorage.setItem('isLoggedIn', String(status));
    if (status) {
      try {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      } catch { /* ignore storage failures */ }
    } else {
      localStorage.removeItem('currentUser');
      setCurrentUser({});
    }
  };

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <ToastProvider>
    <div className={`min-h-screen transition-colors duration-300`} style={{ color: 'var(--text-color)' }}>
      <Router>
        <Routes>
          <Route
            path='/login'
            element={
              /* Only redirect away when we are ALREADY logged in */
              isLoggedIn
                ? <Navigate to='/' replace />
                : <Login onLogin={() => handleLogin(true)} />
            }
          />
          <Route
            path='/*'
            element={
              isLoggedIn ? (
                <div className='flex h-screen overflow-hidden bg-transparent'>
                  {/* Pass isSuperAdmin as a prop so Navbar doesn't need its own localStorage read */}
                  <Navbar
                    onLogout={() => handleLogin(false)}
                    isCollapsed={isSidebarCollapsed}
                    onToggle={toggleSidebar}
                    isSuperAdmin={isSuperAdmin}
                  />
                  <div className='flex-1 flex flex-col min-w-0 overflow-hidden'>
                    <TopNavbar theme={theme} toggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
                    <div id='main-viewport' className='flex-1 overflow-y-auto p-6 custom-scrollbar transition-all duration-300'>
                      <Routes>
                        <Route path='/' element={<Home />} />
                        <Route path='/projects' element={<Projects toggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />} />
                        <Route path='/add-project' element={<AddProject />} />
                        <Route path='/project/:id' element={<ProjectDetails />} />
                        <Route path='/users'        element={<Users />} />
                        {/* Only serve the Permissions page when the currentUser state says admin */}
                        {/* Only serve the Permissions page when the currentUser state says Super Admin */}
                        <Route
                          path='/permissions'
                          element={
                            isRoleValid && isSuperAdmin
                              ? <Permissions />
                              : <Navigate to='/' replace />
                          }
                        />
                        <Route path='*' element={<Navigate to='/' replace />} />
                      </Routes>
                    </div>
                  </div>
                </div>
              ) : (
                <Navigate to='/login' replace />
              )
            }
          />
        </Routes>
      </Router>

      {/* Global Scroll-to-Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className='fixed bottom-8 right-8 bg-[var(--primary-color)] text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all animate-in fade-in zoom-in duration-300 hover:scale-110 active:scale-95 z-[9999] border-none cursor-pointer'
          title='Return to Top'
        >
          <span className='text-xl'>↑</span>
        </button>
      )}
    </div>
    </ToastProvider>
  );
}

export default App;

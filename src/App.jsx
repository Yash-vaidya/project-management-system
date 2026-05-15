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
import { ToastProvider } from './utils/ToastContext';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

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

  const handleLogin = (status) => {
    setIsLoggedIn(status);
    localStorage.setItem('isLoggedIn', status);
  };

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <ToastProvider>
    <div className={`min-h-screen transition-colors duration-300`} style={{ color: 'var(--text-color)' }}>
      <Router>
        <Routes>
          <Route 
            path='/login' 
            element={isLoggedIn ? <Navigate to='/' /> : <Login onLogin={() => handleLogin(true)} />} 
          />
          <Route
            path='/*'
            element={
              isLoggedIn ? (
                <div className='flex h-screen overflow-hidden bg-transparent'>
                  <Navbar onLogout={() => handleLogin(false)} isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
                  <div className='flex-1 flex flex-col min-w-0 overflow-hidden'>
                    <TopNavbar theme={theme} toggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
                    <div id='main-viewport' className='flex-1 overflow-y-auto p-6 custom-scrollbar transition-all duration-300'>
                       <Routes>
                         <Route path='/' element={<Home />} />
                         <Route path='/projects' element={<Projects toggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />} />
                         <Route path='/add-project' element={<AddProject />} />
                         <Route path='/project/:id' element={<ProjectDetails />} />
                         <Route path='/users'        element={<Users />} />
                         <Route
                           path='/permissions'
                           element={
                             (() => {
                               const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                               const isAdmin = currentUser.role === 'Administrator';
                               return isAdmin
                                 ? <Permissions />
                                 : <Navigate to='/' replace />;
                             })()
                           }
                         />
                         <Route path='*'            element={<Navigate to='/' />} />
                       </Routes>
                    </div>
                  </div>
                </div>
              ) : (
                <Navigate to='/login' />
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
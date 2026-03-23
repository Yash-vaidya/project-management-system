import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import AddProject from "./pages/AddProject";
import Navbar from "./components/Navbar";
import ProjectDetails from "./pages/ProjectDetails";


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    document.documentElement.className = "dark";
  }, []);

  useEffect(() => {
    const viewport = document.getElementById("main-viewport");
    if (!viewport) return;

    const handleScroll = () => {
      setShowScrollTop(viewport.scrollTop > 150);
    };

    viewport.addEventListener("scroll", handleScroll);
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, [isLoggedIn]);

  const scrollToTop = () => {
    const viewport = document.getElementById("main-viewport");
    if (viewport) {
      viewport.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleLogin = (status) => {
    setIsLoggedIn(status);
    localStorage.setItem("isLoggedIn", status);
  };

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <div className={`min-h-screen transition-colors duration-300`} style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* Theme Toggle Removed as requested */}

      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={isLoggedIn ? <Navigate to="/" /> : <Login onLogin={() => handleLogin(true)} />} 
          />
          <Route
            path="/*"
            element={
              isLoggedIn ? (
                <div className="flex h-screen overflow-hidden">
                  <Navbar onLogout={() => handleLogin(false)} isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
                  <div id="main-viewport" className={`flex-1 h-full overflow-y-auto bg-transparent transition-all duration-300 ${isSidebarCollapsed ? "ml-0" : ""}`}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/projects" element={<Projects toggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />} />
                      <Route path="/add-project" element={<AddProject />} />
                      <Route path="/project/:id" element={<ProjectDetails />} />
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </div>
                </div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </Router>

      {/* Global Scroll-to-Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-[#ff9999] hover:bg-[#ff8888] text-black w-14 h-14 rounded-full shadow-[0_0_30px_rgba(255,0,0,0.3)] flex items-center justify-center transition-all animate-in fade-in zoom-in duration-300 hover:scale-110 active:scale-95 z-[9999] border-2 border-black/10"
          title="Return to Top"
        >
          <span className="text-2xl font-black">↑</span>
        </button>
      )}
    </div>
  );
}

export default App;

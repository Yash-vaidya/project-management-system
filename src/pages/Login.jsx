import { useState } from "react";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Professional validation with specific credentials requested
    setTimeout(() => {
      if (username === "Yashvaidya" && password === "Pass@123") {
        onLogin();
      } else {
        setError("Invalid credentials. Please try again.");
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center p-4 transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="w-full max-w-md dark:bg-white/10 bg-white/80 backdrop-blur-2xl border dark:border-white/20 border-black/10 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-10 transform scale-100 transition-all duration-500 animate-in fade-in zoom-in-95">
        
        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-[var(--accent-color)]/20 rounded-3xl mb-4 border border-[var(--accent-color)]/20">
            <span className="text-4xl text-white">🏛️</span>
          </div>
          <h1 className="text-3xl font-black dark:text-white text-[var(--text-color)] tracking-tight uppercase mb-2">Internal Portal</h1>
          <p className="dark:text-indigo-200/60 text-black/40 text-sm font-medium tracking-wide font-black uppercase tracking-[0.2em] scale-y-110">Access Matrix</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black dark:text-indigo-300 text-black/40 uppercase tracking-widest mb-2 ml-1">Username Identification</label>
            <input
              type="text"
              required
              className="w-full dark:bg-white/5 bg-black/5 border dark:border-white/10 border-black/10 rounded-2xl px-5 py-4 dark:text-white text-[var(--text-color)] placeholder-black/20 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/50 transition-all font-bold"
              placeholder="Yashvaidya"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black dark:text-indigo-300 text-black/40 uppercase tracking-widest mb-2 ml-1">Secure Vector Pass</label>
            <input
              type="password"
              required
              className="w-full dark:bg-white/5 bg-black/5 border dark:border-white/10 border-black/10 rounded-2xl px-5 py-4 dark:text-white text-[var(--text-color)] placeholder-black/20 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/50 transition-all font-bold"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl text-center animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-black py-4 rounded-2xl shadow-xl shadow-green-600/20 transition-all transform active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
          >
            {isLoading ? (
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
            ) : "AUTHENTICATE SYSTEM"}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t dark:border-white/5 border-black/5 text-center">
          <p className="dark:text-white/20 text-black/20 text-[10px] font-bold tracking-widest uppercase">System version 4.0.2 - Protected Access</p>
        </div>
      </div>
    </div>
  );
}

export default Login;

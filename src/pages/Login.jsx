import logo from '../assets/logo.svg';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ABSOLUTELY STATIC CREDENTIALS - UNCHANGEABLE
  const hardcodedEmail   = 'yashvaidya9623@gmail.com';
  const hardcodedPassword = '9056';
  const adminName        = 'Yash Vaidya';

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const isValid = (
      (username === hardcodedEmail || username.toLowerCase() === adminName.toLowerCase())
      && password === hardcodedPassword
    );

    if (isValid) {
      localStorage.setItem('currentUser', JSON.stringify({
        id: 1,
        name: adminName,
        email: hardcodedEmail,
        role: 'Administrator',
        password: hardcodedPassword
      }));
      onLogin();
    } else {
      setError('⚠️ Incorrect credentials. Please use: Email=yashvaidya9623@gmail.com & Password=9056 OR Name=Yash Vaidya & Password=9056');
      setIsLoading(false);
    }
  };

  return (
    <div className='relative h-screen w-full flex items-center justify-center p-4 overflow-hidden' style={{ backgroundColor: 'var(--bg-color)' }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className='w-full max-w-md relative z-10'>
        {/* Glassmorphism card */}
        <div className='absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-[40px] blur opacity-20'></div>
        <div className='relative dark:bg-white/10 bg-white/80 backdrop-blur-2xl border dark:border-white/20 border-black/10 rounded-[40px] shadow-2xl p-10 transform transition-all duration-500'>
          
          {/* Logo with glow effect */}
          <div className='text-center mb-8'>
            <div className='inline-block p-6 bg-gradient-to-br from-[var(--accent-color)] to-purple-600 rounded-3xl mb-4 shadow-2xl shadow-purple-500/25 border border-white/20 w-24 h-24 relative group'>
              <div className='absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl'></div>
              <img src={logo} alt='Project Logo' className='w-full h-full object-contain relative z-10 filter invert dark:invert-0 group-hover:scale-110 transition-transform duration-300' />
            </div>
            <h1 className='text-4xl font-black dark:text-white text-[var(--text-color)] tracking-tight bg-gradient-to-r from-[var(--accent-color)] to-purple-600 bg-clip-text text-transparent mb-2'>
              Welcome Back
            </h1>
            <p className='dark:text-indigo-200/60 text-black/40 text-sm font-medium tracking-wide font-black uppercase tracking-[0.2em] scale-y-110'>
              Project Tracking System
            </p>
          </div>

          <form onSubmit={handleLogin} className='space-y-6'>
            <div className='animate-fade-up'>
              <label className='block text-[10px] font-black dark:text-indigo-300 text-black/40 uppercase tracking-widest mb-2 ml-1'>
                Username / Email
              </label>
              <div className='relative group'>
                <input
                  type='text'
                  required
                  className='w-full dark:bg-white/5 bg-black/5 border dark:border-white/10 border-black/10 rounded-2xl px-5 py-4 dark:text-white text-[var(--text-color)] placeholder-black/20 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/50 transition-all font-bold pl-12'
                  placeholder='Enter username or email'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <div className='absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent-color)] opacity-50 group-focus-within:opacity-100 transition-opacity'>
                  👤
                </div>
              </div>
            </div>

            <div className='animate-fade-up delay-100'>
              <label className='block text-[10px] font-black dark:text-indigo-300 text-black/40 uppercase tracking-widest mb-2 ml-1'>
                Password
              </label>
              <div className='relative group'>
                <input
                  type='password'
                  required
                  className='w-full dark:bg-white/5 bg-black/5 border dark:border-white/10 border-black/10 rounded-2xl px-5 py-4 dark:text-white text-[var(--text-color)] placeholder-black/20 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/50 transition-all font-bold pl-12'
                  placeholder='Enter password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className='absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent-color)] opacity-50 group-focus-within:opacity-100 transition-opacity'>
                  🔒
                </div>
              </div>
            </div>

            {error && (
              <div className='bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl text-center animate-pulse'>
                {error}
              </div>
            )}

            <div className='animate-fade-up delay-200'>
              <button
                type='submit'
                disabled={isLoading}
                className={`w-full bg-gradient-to-r from-[var(--accent-color)] to-purple-600 hover:from-[var(--accent-hover)] hover:to-purple-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-purple-600/20 hover:shadow-2xl hover:shadow-purple-600/30 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isLoading ? (
                  <span className='flex gap-1'>
                    <span className='w-1.5 h-1.5 bg-white rounded-full animate-bounce'></span>
                    <span className='w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.2s]'></span>
                    <span className='w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.4s]'></span>
                  </span>
                ) : (
                  <span className='flex items-center gap-2'>
                    Login <span className='text-xl'>→</span>
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Decorative elements */}
          <div className='mt-8 pt-6 border-t dark:border-white/5 border-black/5 text-center'>
            <p className='dark:text-white/20 text-black/20 text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-2'>
              <span className='w-8 h-px bg-current'></span>
              Version 1.0
              <span className='w-8 h-px bg-current'></span>
            </p>
          </div>
        </div>
      </div>

      {/* Add custom animation styles */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fade-up {
          opacity: 0;
          transform: translateY(20px);
          animation: fade-up 0.5s forwards;
        }
        .animate-fade-up.delay-100 { animation-delay: 0.1s; }
        .animate-fade-up.delay-200 { animation-delay: 0.2s; }
        @keyframes fade-up {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Login;
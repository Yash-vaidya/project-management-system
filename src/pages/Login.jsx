import logo from '../assets/logo.svg';
import { useState } from 'react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ABSOLUTELY STATIC CREDENTIALS - UNCHANGEABLE
  const hardcodedEmail = 'yashvaidya9623@gmail.com';
  const hardcodedPassword = '9056';
  const adminName = 'Yash Vaidya';

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
    <div className='min-h-screen flex items-center justify-center p-4' style={{ backgroundColor: '#f8fafc' }}>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-8'>
        {/* Brand header */}
        <div className='text-center mb-10'>
          <div className='flex justify-center mb-4'>
            <div className='w-16 h-16 bg-[#556EE6] rounded-xl flex items-center justify-center shadow-lg shadow-[#556EE6]/20'>
              <img src={logo} alt='Project Logo' className='w-10 h-10 object-contain' />
            </div>
          </div>
          <h1 className='text-2xl font-bold tracking-tight text-gray-900'>
            Trackbord
          </h1>
          <p className='text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-2'>
            Admin Dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className='space-y-5'>
          {error && (
            <div className='bg-red-50 border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl text-center'>
              {error}
            </div>
          )}

          <div>
            <label className='block text-[9px] font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1'>
              Username / Email
            </label>
            <input
              type='text'
              required
              className='w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#556EE6] transition-all font-medium'
              placeholder='Enter username or email'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className='block text-[9px] font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1'>
              Password
            </label>
            <input
              type='password'
              required
              className='w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#556EE6] transition-all font-medium'
              placeholder='Enter password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className={`w-full bg-[#556EE6] hover:bg-[#4356C0] text-white h-11 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
          >
            {isLoading ? (
              <>
                <span className='flex gap-1'>
                  <span className='w-2 h-2 bg-white rounded-full animate-bounce'></span>
                  <span className='w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]'></span>
                  <span className='w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.4s]'></span>
                </span>
                <span className='text-[10px] font-black uppercase tracking-widest'>Loading...</span>
              </>
            ) : (
              <span className='text-[10px] font-black uppercase tracking-widest flex items-center gap-2'>
                Login <span className='text-lg'>→</span>
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

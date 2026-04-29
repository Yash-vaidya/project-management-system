import { useState } from "react";
import logo from "../assets/logo.svg";
import AnimatedEye from "../components/AnimatedEye";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const savedUsers = localStorage.getItem('systemUsers');
      const users = savedUsers ? JSON.parse(savedUsers) : [];

      // Find user by mobile number and password
      const user = users.find(u => u.mobile === username && u.password === password);

      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        onLogin();
      } else {
        setError('Invalid mobile number or password.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--primary-color)]/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="p-4 bg-gradient-to-br from-[var(--primary-color)] to-purple-600 rounded-2xl shadow-lg">
              <img
                src={logo}
                alt="Project Logo"
                className="w-16 h-16 object-contain filter brightness-0 invert"
              />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black bg-gradient-to-r from-[var(--primary-color)] to-purple-600 bg-clip-text text-transparent uppercase">
              Welcome Back
            </h1>
            <p className="text-gray-500 text-sm mt-2">Sign in to continue</p>
          </div>

           {/* Form */}
           <form onSubmit={handleLogin} className="space-y-5">
             {/* Mobile Number */}
             <div>
               <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-widest">
                 Mobile Number *
               </label>
               <input
                 type="tel"
                 required
                 value={username}
                 onChange={(e) => setUsername(e.target.value)}
                 placeholder="Enter 10-digit mobile number"
                 className="w-full bg-white border-2 border-gray-300 rounded-xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 focus:border-[var(--primary-color)] transition-all font-medium shadow-sm"
               />
             </div>

             {/* Password */}
             <div>
               <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-widest">
                 Password *
               </label>
               <div className="relative">
                 <input
                   type={showPassword ? "text" : "password"}
                   required
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="Enter your password"
                   className="w-full bg-white border-2 border-gray-300 rounded-xl px-5 py-4 pr-12 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 focus:border-[var(--primary-color)] transition-all font-medium shadow-sm"
                 />
                 <button
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-[var(--primary-color)] transition-colors"
                   title={showPassword ? "Hide password" : "Show password"}
                 >
                   <AnimatedEye isOpen={showPassword} />
                 </button>
               </div>
             </div>

             {/* Error */}
             {error && (
               <div className="bg-red-50 border-2 border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl font-medium">
                 {error}
               </div>
             )}

             {/* Button */}
             <button
               type="submit"
               disabled={isLoading}
               className="w-full bg-gradient-to-r from-[var(--primary-color)] to-purple-600 hover:from-[#3A56D0] hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-[var(--primary-color)]/30 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
             >
               {isLoading ? (
                 <span className="flex gap-1.5">
                   <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce"></span>
                   <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></span>
                   <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></span>
                 </span>
              ) : "Sign In"}
             </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account? 
            <span className="text-[var(--primary-color)] font-bold cursor-pointer ml-1">
              Contact Admin
            </span>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[var(--primary-color)] via-purple-600 to-indigo-700 items-center justify-center text-white">
        <div className="text-center">
          <img
            src={logo}
            alt="Logo"
            className="w-32 h-32 mx-auto mb-6 filter brightness-0 invert"
          />

          <h2 className="text-3xl font-black uppercase mb-4">
            Project Management
          </h2>

          <p className="text-lg text-white/80">
            Streamline your workflow
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

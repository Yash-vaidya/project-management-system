import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Fake credentials
    if (username === "admin" && password === "1234") {
      navigate("/"); // Go to Home
    } else {
      alert("Invalid username or password");
    }
  };

  return (
    <div className="h-screen flex">
      {/* Left Side */}
      <div className="w-1/2 bg-blue-600 flex items-center justify-center">
        <h1 className="text-white text-3xl font-bold">Project Management</h1>
      </div>

      {/* Right Side */}
      <div className="w-1/2 flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg w-80">
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

          <input
            type="text"
            placeholder="Username"
            className="w-full mb-4 p-2 border rounded-lg"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full mb-4 p-2 border rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
            onClick={handleLogin}
          >
            Login
          </button>

          <p className="text-sm text-center mt-4 text-blue-500 cursor-pointer">
            Forgot Password?
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

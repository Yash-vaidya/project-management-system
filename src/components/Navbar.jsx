import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col p-4">
      <h1 className="text-xl font-bold mb-6">Project Management</h1>

      <NavLink
        to="/"
        className={({ isActive }) =>
          `mb-4 p-2 rounded ${isActive ? "bg-blue-600" : "hover:bg-gray-700"}`
        }
      >
        Home
      </NavLink>

      <NavLink
        to="/projects"
        className={({ isActive }) =>
          `mb-4 p-2 rounded ${isActive ? "bg-blue-600" : "hover:bg-gray-700"}`
        }
      >
        Projects
      </NavLink>

      <NavLink
        to="/add-project"
        className={({ isActive }) =>
          `mb-4 p-2 rounded ${isActive ? "bg-blue-600" : "hover:bg-gray-700"}`
        }
      >
        Add Project
      </NavLink>
    </div>
  );
}

export default Navbar;

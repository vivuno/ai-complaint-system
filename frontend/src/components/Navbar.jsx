import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");
  const email = localStorage.getItem("email");

  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow position-relative">
      <div className="container">
        
        {/* LOGO */}
        <Link className="navbar-brand fw-bold" to="/">
          AI Complaint System
        </Link>

        {/* ✅ MOBILE TOGGLE BUTTON */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* ✅ COLLAPSIBLE MENU */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">

            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/status">Status</Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/about">About</Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/contact">Contact</Link>
            </li>

            {/* USER DASHBOARD */}
            {token && role === "user" && (
              <li className="nav-item">
                <Link className="nav-link" to="/user-dashboard">
                  Dashboard
                </Link>
              </li>
            )}

            {/* ADMIN DASHBOARD */}
            {token && role === "admin" && (
              <li className="nav-item">
                <Link className="nav-link text-warning fw-bold" to="/admin-dashboard">
                  Admin Panel
                </Link>
              </li>
            )}

            {/* LOGIN */}
            {!token && (
              <li className="nav-item">
                <Link className="btn btn-light ms-2" to="/login">
                  Login
                </Link>
              </li>
            )}

            {/* PROFILE DROPDOWN */}
            {token && (
              <li className="nav-item position-relative">
                <button
                  className="btn btn-light ms-2"
                  onClick={() => setShowProfile(prev => !prev)}
                >
                  👤 {username || "User"}
                </button>

                {/* PROFILE CARD */}
                {showProfile && (
                  <div
                    className="card p-3 shadow"
                    style={{
                      position: "absolute",
                      right: "0",
                      top: "45px",
                      width: "230px",
                      zIndex: 9999
                    }}
                  >
                    <h6 className="mb-1">{username}</h6>
                    <p className="text-muted small mb-2">
                      {email}
                    </p>
                    <button
      className="btn btn-outline-primary btn-sm w-100 mb-2"
      onClick={() => navigate("/forgot-password")}
    >
      Forgot Password
    </button>

                    <button
                      className="btn btn-danger btn-sm w-100"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </li>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

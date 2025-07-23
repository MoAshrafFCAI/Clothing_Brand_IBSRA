import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../App";

function Navbar() {
  const { token, setToken, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken("");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav style={{ padding: 10, borderBottom: "1px solid #ccc", marginBottom: 20 }}>
      <Link to="/">Home</Link> {" | "}
      {token ? (
        <>
          <Link to="/cart">Cart</Link> {" | "}
          <Link to="/profile">Profile</Link> {" | "}
          <Link to="/orders">Orders</Link> {" | "}
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link> {" | "}
          <Link to="/signup">Signup</Link>
        </>
      )}
    </nav>
  );
}

export default Navbar; 
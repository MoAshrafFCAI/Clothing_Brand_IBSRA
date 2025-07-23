import React, { useState, useContext } from "react";
import { AuthContext } from "../App";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000";

function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const login = () => {
    const data = new URLSearchParams();
    data.append("username", form.username);
    data.append("password", form.password);
    fetch(`${API}/token`, {
      method: "POST",
      body: data,
    })
      .then(res => res.json())
      .then(data => {
        if (data.access_token) {
          setToken(data.access_token);
          navigate("/");
        } else {
          setError(data.detail || "Login failed");
        }
      });
  };

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="Username" onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
      <input placeholder="Password" type="password" onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
      <button onClick={login}>Login</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}

export default LoginPage; 
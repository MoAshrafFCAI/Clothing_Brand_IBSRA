import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000";

function SignupPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const signup = () => {
    fetch(`${API}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(res => {
        if (res.ok) return res.json();
        return res.json().then(data => Promise.reject(data));
      })
      .then(() => {
        alert("Signup successful! Please login.");
        navigate("/login");
      })
      .catch(data => setError(data.detail || "Signup failed"));
  };

  return (
    <div>
      <h2>Signup</h2>
      <input placeholder="Username" onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
      <input placeholder="Email" onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
      <input placeholder="Password" type="password" onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
      <button onClick={signup}>Signup</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}

export default SignupPage; 
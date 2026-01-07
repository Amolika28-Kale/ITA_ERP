import { useState } from "react";
import { login } from "../services/authService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await login({ email, password });
    localStorage.setItem("token", res.data.token);
    window.location.href = "/dashboard";
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-80 space-y-4">
        <h2 className="text-xl font-bold">Admin Login</h2>
        <input className="border w-full p-2" placeholder="Email" onChange={e=>setEmail(e.target.value)} />
        <input className="border w-full p-2" type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)} />
        <button className="bg-black text-white w-full p-2" onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
}

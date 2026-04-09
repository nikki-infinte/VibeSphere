import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthPanel() {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "user",
    city: "",
    latitude: "",
    longitude: "",
  });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isSignup) {
        await signup({
          ...form,
          latitude: form.latitude ? Number(form.latitude) : null,
          longitude: form.longitude ? Number(form.longitude) : null,
        });
      } else {
        await login(form.email, form.password);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Authentication failed");
    }
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <h2 className="text-xl font-semibold">{isSignup ? "Create account" : "Login"}</h2>
      <form className="mt-4 space-y-3" onSubmit={submit}>
        {isSignup && (
          <>
            <input className="w-full rounded border p-2" placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
            <select className="w-full rounded border p-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="user">User</option>
              <option value="host">Host</option>
            </select>
            <input className="w-full rounded border p-2" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <input className="rounded border p-2" placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
              <input className="rounded border p-2" placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
            </div>
          </>
        )}
        <input className="w-full rounded border p-2" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="w-full rounded border p-2" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded bg-slate-900 p-2 text-white">{isSignup ? "Sign up" : "Login"}</button>
      </form>
      <button className="mt-3 text-sm text-blue-600" onClick={() => setIsSignup((s) => !s)}>
        {isSignup ? "Have an account? Login" : "New user? Signup"}
      </button>
    </div>
  );
}

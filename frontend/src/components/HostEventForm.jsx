import { useState } from "react";
import api from "../api/client";

const initial = {
  title: "",
  description: "",
  category: "Music",
  event_date: "",
  venue_name: "",
  latitude: "",
  longitude: "",
  price: "",
  capacity: "",
  image_url: "",
};

export default function HostEventForm({ onCreated }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/events", {
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        price: Number(form.price),
        capacity: Number(form.capacity),
      });
      setForm(initial);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not create event");
    }
  };

  return (
    <form onSubmit={submit} className="rounded-xl bg-white p-4 shadow space-y-2">
      <h3 className="text-lg font-semibold">Host dashboard: Create event</h3>
      <input className="w-full rounded border p-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      <textarea className="w-full rounded border p-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
      <div className="grid grid-cols-2 gap-2">
        <input className="rounded border p-2" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input className="rounded border p-2" type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} required />
      </div>
      <input className="w-full rounded border p-2" placeholder="Venue name" value={form.venue_name} onChange={(e) => setForm({ ...form, venue_name: e.target.value })} required />
      <div className="grid grid-cols-2 gap-2">
        <input className="rounded border p-2" placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} required />
        <input className="rounded border p-2" placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} required />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input className="rounded border p-2" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        <input className="rounded border p-2" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required />
      </div>
      <input className="w-full rounded border p-2" placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="rounded bg-indigo-700 px-3 py-2 text-white">Publish Event</button>
    </form>
  );
}

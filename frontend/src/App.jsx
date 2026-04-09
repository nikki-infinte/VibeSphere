import { useEffect, useState } from "react";
import api from "./api/client";
import AuthPanel from "./components/AuthPanel";
import ChatbotPanel from "./components/ChatbotPanel";
import EventCard from "./components/EventCard";
import HostEventForm from "./components/HostEventForm";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user, token, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [trending, setTrending] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [search, setSearch] = useState("");
  const [autocomplete, setAutocomplete] = useState([]);
  const [position, setPosition] = useState({ lat: 28.6139, lon: 77.209 });

  const loadEvents = async () => {
    const [nearby, top] = await Promise.all([
      api.get(`/discover/nearby?lat=${position.lat}&lon=${position.lon}&distance_km=30`),
      api.get("/discover/trending?k=6"),
    ]);
    setEvents(nearby.data);
    setTrending(top.data);
    if (token) {
      const rec = await api.get("/discover/recommended");
      setRecommendations(rec.data);
    }
  };

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const detectLocation = () => {
    navigator.geolocation.getCurrentPosition((p) => {
      setPosition({ lat: p.coords.latitude, lon: p.coords.longitude });
    });
  };

  useEffect(() => {
    if (!search.trim()) {
      setAutocomplete([]);
      return;
    }
    const id = setTimeout(async () => {
      const { data } = await api.get(`/events/autocomplete?q=${encodeURIComponent(search)}`);
      setAutocomplete(data.results);
    }, 250);
    return () => clearTimeout(id);
  }, [search]);

  const book = async (eventId) => {
    try {
      await api.post("/bookings", { event_id: eventId, quantity: 1 });
      await loadEvents();
      alert("Booking confirmed");
    } catch (err) {
      alert(err.response?.data?.detail || "Booking failed");
    }
  };

  if (!token || !user) {
    return (
      <main className="mx-auto max-w-md p-8">
        <h1 className="mb-4 text-3xl font-bold">Smart Event Discovery</h1>
        <AuthPanel />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user.full_name}</h1>
          <p className="text-sm text-slate-600">Role: {user.role}</p>
        </div>
        <button className="rounded bg-slate-900 px-3 py-2 text-white" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="mb-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow">
          <h3 className="font-semibold">Search events</h3>
          <input className="mt-2 w-full rounded border p-2" placeholder="Type event name..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {autocomplete.length > 0 && (
            <ul className="mt-2 rounded border bg-white p-2 text-sm">
              {autocomplete.map((item) => (
                <li key={item.id}>{item.title}</li>
              ))}
            </ul>
          )}
          <button className="mt-2 rounded bg-blue-700 px-3 py-2 text-white" onClick={detectLocation}>
            Detect My Location
          </button>
        </div>
        <ChatbotPanel />
      </div>

      {user.role === "host" && <HostEventForm onCreated={loadEvents} />}

      <section className="mt-6">
        <h2 className="mb-3 text-xl font-semibold">Nearby Events</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} onBook={book} />
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-xl font-semibold">Trending</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {trending.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-xl font-semibold">Recommended For You</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((event) => (
            <EventCard key={event.id} event={event} onBook={book} />
          ))}
        </div>
      </section>
    </main>
  );
}

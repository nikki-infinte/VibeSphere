import { useState } from "react";
import api from "../api/client";

export default function ChatbotPanel() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [source, setSource] = useState("");

  const ask = async () => {
    if (!message.trim()) return;
    const { data } = await api.post("/chatbot/chat", { message });
    setReply(data.reply);
    setSource(data.source);
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <h3 className="text-lg font-semibold">VibeScout AI Concierge</h3>
      <div className="mt-2 flex gap-2">
        <input className="flex-1 rounded border p-2" placeholder="Suggest weekend plans near me" value={message} onChange={(e) => setMessage(e.target.value)} />
        <button className="rounded bg-purple-700 px-3 text-white" onClick={ask}>
          Ask
        </button>
      </div>
      {reply && (
        <div className="mt-3 rounded bg-slate-50 p-3 text-sm">
          <p>{reply}</p>
          <p className="mt-2 text-xs text-slate-500">Source: {source}</p>
        </div>
      )}
    </div>
  );
}

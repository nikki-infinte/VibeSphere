export default function EventCard({ event, onBook }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <h3 className="text-lg font-semibold">{event.title}</h3>
      <p className="text-sm text-slate-600">{event.category}</p>
      <p className="mt-2 text-sm">{event.description}</p>
      <p className="mt-2 text-sm">Date: {new Date(event.event_date).toLocaleString()}</p>
      <p className="text-sm">Venue: {event.venue_name}</p>
      <p className="text-sm">Price: ${event.price}</p>
      <p className="text-sm">Tickets left: {event.tickets_available}</p>
      {onBook && (
        <button className="mt-3 rounded bg-emerald-600 px-3 py-2 text-sm text-white" onClick={() => onBook(event.id)}>
          Book
        </button>
      )}
    </div>
  );
}

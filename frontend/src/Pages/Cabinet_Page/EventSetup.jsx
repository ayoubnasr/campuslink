import { useState } from "react";

const EventSetup = ({ addEvent }) => {
  const [event, setEvent] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    maxParticipants: "",
    exclusivity: "public",
    ticketPrice: "",
  });

  const handleChange = (e) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!event.title || !event.date) {
      alert("Title and Date are required!");
      return;
    }

    addEvent(event); // ✅ Add event to state in CabinetPage

    // Clear the form
    setEvent({
      title: "",
      description: "",
      date: "",
      location: "",
      maxParticipants: "",
      exclusivity: "public",
      ticketPrice: "",
    });

    alert("Event Created Successfully!");
  };

  return (
    <div className="event-form-container">
      <h2>Create Event</h2>
      <form onSubmit={handleSubmit} className="event-form">
        <input type="text" name="title" placeholder="Event Title" value={event.title} onChange={handleChange} required />
        <textarea name="description" placeholder="Event Description" value={event.description} onChange={handleChange} />
        <input type="date" name="date" value={event.date} onChange={handleChange} required />
        <input type="text" name="location" placeholder="Location" value={event.location} onChange={handleChange} />
        <input type="number" name="maxParticipants" placeholder="Max Participants" value={event.maxParticipants} onChange={handleChange} />
        
        <select name="exclusivity" value={event.exclusivity} onChange={handleChange}>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>

        <input type="number" name="ticketPrice" placeholder="Ticket Price ($)" value={event.ticketPrice} onChange={handleChange} />

        <button type="submit">Create Event</button>
      </form>
    </div>
  );
};

export default EventSetup;

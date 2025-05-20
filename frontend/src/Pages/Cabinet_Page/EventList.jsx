import React from "react";

const EventList = ({ events, deleteEvent }) => {
  return (
    <div className="event-list">
      <h2>Upcoming Events</h2>
      {events.map((event, index) => (
        <div key={index} className="event-item">
          <h3>{event.title}</h3>
          <p><strong>Description:</strong> {event.description}</p>
          <p><strong>Date:</strong> 📅 {event.date}</p>
          <p><strong>Location:</strong> 📍 {event.location || "Not specified"}</p>
          <p><strong>Max Participants:</strong> 👥 {event.maxParticipants || "N/A"}</p>
          <p><strong>Exclusivity:</strong> 🔒 {event.exclusivity}</p>
          <p><strong>Ticket Price:</strong> 💰 ${event.ticketPrice || "0"}</p>

          {/* ✅ Updated Delete Button */}
          <button className="delete-btn" onClick={() => deleteEvent(index)}>
            ❌ Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default EventList;

import React, { useState } from "react";

const EventForm = ({ addEvent }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState(""); // ✅ Event time selection restored
  const [location, setLocation] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [exclusivity, setExclusivity] = useState("Public");
  const [ticketPrice, setTicketPrice] = useState("");
  const [image, setImage] = useState(null); // ✅ Event image upload added

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !date || !time) {
      alert("Please fill in the event title, date, and time.");
      return;
    }

    addEvent({
      title,
      description,
      date,
      time,
      location,
      maxParticipants: Math.max(1, parseInt(maxParticipants) || 1),
      exclusivity,
      ticketPrice: Math.max(0, parseFloat(ticketPrice) || 0),
      image,
    });

    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setLocation("");
    setMaxParticipants("");
    setExclusivity("Public");
    setTicketPrice("");
    setImage(null);
  };

  return (
    <form onSubmit={handleSubmit} className="event-form">
      <input
        type="text"
        placeholder="Event Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Event Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <input
        type="number"
        placeholder="Max Participants"
        value={maxParticipants}
        onChange={(e) => setMaxParticipants(e.target.value)}
        min="1"
      />
      <select value={exclusivity} onChange={(e) => setExclusivity(e.target.value)}>
        <option value="Public">Public</option>
        <option value="Private">Private</option>
      </select>
      <input
        type="number"
        placeholder="Ticket Price"
        value={ticketPrice}
        onChange={(e) => setTicketPrice(e.target.value)}
        min="0"
        step="0.01"
      />
      
      {/* ✅ Image Upload */}
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {image && <img src={image} alt="Event Preview" style={{ width: "100px", marginTop: "10px" }} />}

      <button type="submit">Add Event</button>
    </form>
  );
};

export default EventForm;
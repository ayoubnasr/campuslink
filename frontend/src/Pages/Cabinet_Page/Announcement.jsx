import React, { useState } from "react";

const Announcements = ({ addAnnouncement }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !content) {
      alert("Please fill out all fields.");
      return;
    }

    addAnnouncement({ title, content, likes: 0, comments: [] });

    // Reset form
    setTitle("");
    setContent("");
  };

  return (
    <div>
      <h3>Create Announcement</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="Write announcement..." value={content} onChange={(e) => setContent(e.target.value)} required />
        <button type="submit">Post Announcement</button>
      </form>
    </div>
  );
};

export default Announcements;
import React, { useState } from "react";

const ClubDescription = ({ description, updateDescription }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState(description);

  const handleSave = () => {
    updateDescription(newDescription);
    setIsEditing(false);
  };

  return (
    <div>
      <h2>Club Description</h2>
      {isEditing ? (
        <>
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
          <button onClick={handleSave}>Save</button>
        </>
      ) : (
        <>
          <p>{description}</p>
          <button onClick={() => setIsEditing(true)}>Edit Description</button>
        </>
      )}
    </div>
  );
};

export default ClubDescription;
import React, { useState } from "react";

const ClubProfile = () => {
  const [clubImage, setClubImage] = useState(null);
  const [fileName, setFileName] = useState("No file chosen");

  // Function to handle file selection
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setClubImage(imageUrl);
      setFileName(file.name);
    }
  };

  // Function to remove uploaded image
  const removeImage = () => {
    setClubImage(null);
    setFileName("No file chosen");
  };

  return (
    <div className="club-profile">
      <div className="file-upload">
        {clubImage ? (
          <>
            <img src={clubImage} alt="Club Profile" className="club-image" />
            <button onClick={removeImage}>Remove Image</button>
          </>
        ) : (
          <>
            <label htmlFor="upload">Choose File</label>
            <input type="file" id="upload" onChange={handleImageUpload} accept="image/*" />
            <p className="file-name">{fileName}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ClubProfile;

import React, { useState, useRef } from "react";
import {formInputStyle, formButtonStyle, profileEditorFormContainerStyle} from './ProfileEditorFormStyle.jsx';
import {request_update_club_profile} from "./profileEditor_requests.js"; // Adjust import as needed
import { FaPen, FaTrash } from "react-icons/fa";
import CharCountTextArea from "../CharCountTextArea/CharCountTextArea.jsx";

const ProfileEditorForm = ({ initial_club_title, initial_club_bio, initial_club_Email, initial_club_profile_photo_url, setEditingProfile, setReloadClubProfile}) => {
    const [clubTitle, setClubTitle] = useState(initial_club_title);
    const maxClubTitleLength = 255;
    const [clubBio, setClubBio] = useState(initial_club_bio || "");
    const maxClubBioLength = 500;
    const [clubEmail, setClubEmail] = useState(initial_club_Email);
    const [profilePhoto, setProfilePhoto] = useState(initial_club_profile_photo_url);
    const [profilePhotoFile, setProfilePhotoFile] = useState("");
    
    const profilePhotoRef = useRef(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [profilePhotoMenuOpen, setProfilePhotoMenu] = useState(false);

    const handleProfilePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setProfilePhoto(reader.result);
        reader.readAsDataURL(file);
        setProfilePhotoFile(file);
    };

    const handleRemoveProfilePhoto = () => {
        setProfilePhoto(null);
        if (profilePhotoRef.current) profilePhotoRef.current.value = "";
    };

    const handleUpdateProfile = async () => {

      const newProfile = {
          new_title: clubTitle,
          new_bio: clubBio,
          new_email: clubEmail
      };

      const formData = new FormData();
      formData.append("new_profile", JSON.stringify(newProfile));
      formData.append("profile_pic", (profilePhotoFile)?profilePhotoFile:null);

      const result = await request_update_club_profile(formData);

      if (!result.success) {
          setErrorMessage(result.message);
          return;
      }

      setSuccessMessage(result.message);
      setErrorMessage("");
      setClubTitle("");
      setClubBio("");
      setClubEmail("");
      setEditingProfile(false);
    };

    const handleEditPicIconClick = () => {
      profilePhotoRef.current.click(); // Triggers the hidden file input
    };

    return (
        <div style={profileEditorFormContainerStyle}>
          
          <h2 style={{ marginBottom: "15px" }}>Update Profile Information:</h2>
          
          <div style={{display: "flex", flexDirection: "row", gap: "25px", paddingLeft: "10px", width: "100%"}}>
            <div style={{display: "flex", flexDirection: "column"}}>
              <div style={{ position: "relative", width: "150px", height: "150px" }}>
                <img
                  src={profilePhoto}
                  alt="profile"
                  onClick={() => setProfilePhotoMenu(!profilePhotoMenuOpen)}
                  style={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    cursor: "pointer"
                  }}
                />
                
                <div
                  onClick={() => setProfilePhotoMenu(!profilePhotoMenuOpen)}
                  style={{
                    width: "30px",
                    height: "30px",
                    position: "absolute",
                    bottom: "10px",
                    right: "10px",
                    backgroundColor: "#fff",
                    borderRadius: "50%",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <FaPen color="#1f2a38" size={14} />
                </div>
              </div>  
              <input
                type="file"
                accept="image/*"
                ref={profilePhotoRef}
                onChange={handleProfilePhotoUpload}
                style={{ display: "none" }} // Hides the default file input
              />
              {profilePhotoMenuOpen && 
              (
                <div style={{display: "flex", flexDirection: "column", paddingTop: "10px"}}>
                  <div
                    onClick={handleEditPicIconClick}
                    style={{
                      borderRadius: "4px 4px 0px 0px",
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                      alignItems: "center",
                      textAlign: "center",
                      justifyContent: "center",
                      fontSize: "12px"
                    }}
                  >
                    Change photo
                  </div>
                  {profilePhoto && (
                    <>
                      <button
                        onClick={handleRemoveProfilePhoto}
                        style={{
                          backgroundColor: "red",
                          color: "#fff",
                          border: "none",
                          borderRadius: "0px 0px 4px 4px",
                          padding: "5px 10px",
                          cursor: "pointer",
                          fontSize: "6px"
                        }}
                      >
                        <FaTrash size={8}/>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <div>
                
                <CharCountTextArea value={clubTitle} onChange={(e) => setClubTitle(e.target.value)}
                placeholder="Add a club bio here." maxLength={maxClubTitleLength} style={formInputStyle} />
                
                <CharCountTextArea value={clubBio} onChange={(e) => setClubBio(e.target.value)}
                placeholder="Add a club bio here." maxLength={maxClubBioLength} height="100px" style={{
                  ...formInputStyle, 
                  resize: "vertical",
                  height: "100px"}} />

                <input
                  type="text"
                  placeholder="Club Email (*)"
                  value={clubEmail}
                  onChange={(e) => setClubEmail(e.target.value)}
                  style={formInputStyle}
                />

                {/* Buttons */}
                <button onClick={async () => {await handleUpdateProfile(); setReloadClubProfile(prevState => !prevState);}} style={formButtonStyle}>
                  Apply Changes
                </button>
                <button
                  onClick={() => setEditingProfile(false)}
                  style={{ ...formButtonStyle, backgroundColor: "#ccc", color: "#000" }}
                >
                  Cancel
                </button>

                
                        
                  {/* Error / Success Messages */}
                  {successMessage && (
                    <p style={{ color: "green", fontWeight: "bold", padding: "8px", borderRadius: "5px", fontSize: "15px", textAlign: "center"}}>
                      {successMessage}
                    </p>
                  )}
                  {errorMessage && (
                    <p style={{ color: "red", fontWeight: "bold", padding: "8px", borderRadius: "5px", fontSize: "15px", textAlign: "center" }}>
                      {errorMessage}
                    </p>
                  )}
            </div>
          </div>
        </div>
    );
};

export default ProfileEditorForm;

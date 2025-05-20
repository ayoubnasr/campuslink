import React, { useState, useEffect, useRef } from "react";
import {formInputStyle, formSelectStyle, formButtonStyle, createFormContainerStyle} from '../Home_Page/StudentHomePageStyle.jsx';
import {request_create_club_post, request_location_from_nominatim} from "./postcreation_requests.js"; // Adjust import as needed
import LocationSearchBar from "../LocationSearchBar/LocationSearchBar.jsx";

const PostForm = ({ setCreatingPost, setPosts, posts, setReloadClubProfile }) => {
    const [isEvent, setIsEvent] = useState(false);
    const [postTitle, setPostTitle] = useState("");
    const [postDetails, setPostDetails] = useState("");
    const [postImageFile, setPostImageFile] = useState("");
    const [eventTitle, setEventTitle] = useState("");
    const [eventDetails, setEventDetails] = useState("");
    const [eventDate, setEventDate] = useState("");

    const [eventStartTime, setEventStartTime] = useState("");
    const [eventEndTime, setEventEndTime] = useState("");

    const [eventLocation_displayName, setEventLocation_displayName] = useState("");
    const [eventLocation_latitude, setEventLocation_latitude] = useState(null);
    const [eventLocation_longitude, setEventLocation_longitude] = useState(null);


    
    const [eventMaxParticipants, setEventMaxParticipants] = useState("");
    const [eventIsPublic, setEventIsPublic] = useState("Public");
    const [eventTicketPrice, setEventTicketPrice] = useState("");
    const [postImage, setPostImage] = useState(null);
    
    const eventImageRef = useRef(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handlePostImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setPostImage(reader.result);
        reader.readAsDataURL(file);
        setPostImageFile(file);
    };

    const handleRemoveEventImage = () => {
        setPostImage(null);
        if (eventImageRef.current) eventImageRef.current.value = "";
    };

    const handlePostCreation = async () => {
        const newPost = {
            post_title: postTitle,
            post_details: postDetails,
            is_event: isEvent,
            event_title: eventTitle,
            event_details: eventDetails,
            event_date: eventDate,
            event_startTime: eventStartTime,
            event_endTime: eventEndTime,
            event_location_name: eventLocation_displayName,
            event_location_latitude: eventLocation_latitude,
            event_location_longitude: eventLocation_longitude,
            event_max_participation: eventMaxParticipants,
            event_exclusive: eventIsPublic === "Public" ? 0 : 1,
            event_ticket_price: eventTicketPrice,
        };

        const formData = new FormData();
        formData.append("post_obj", JSON.stringify(newPost));
        formData.append("post_image", postImageFile);


        const post_result = await request_create_club_post(formData);

        if (!post_result.success) {
            setErrorMessage(post_result.message);
            return;
        }

        setSuccessMessage(post_result.message);
        setErrorMessage("");
        setPosts([...posts, newPost]);
        setPostTitle("");
        setPostDetails("");
        setPostImage(null);
        setEventDate("");
        setEventStartTime("");
        setEventEndTime("");
        setEventLocation_displayName("");
        setEventLocation_latitude(null);
        setEventLocation_longitude(null);
        setEventMaxParticipants("");
        setEventIsPublic("Public");
        setEventTicketPrice("");
        setCreatingPost(false);
    };


    return (
        <div style={createFormContainerStyle}>
                <h2 style={{ marginBottom: "15px" }}>CREATE NEW POST</h2>
                <input
                  type="text"
                  placeholder="Post Title (*)"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  style={formInputStyle}
                />
                <textarea
                  placeholder="Event Description"
                  value={postDetails}
                  onChange={(e) => setPostDetails(e.target.value)}
                  style={{ ...formInputStyle, resize: "vertical", height: "80px" }}
                />
                {/* Square image area */}
                <div
                  style={{
                    width: "100%",
                    minHeight: "200px",
                    backgroundColor: "#444",
                    borderRadius: "5px",
                    marginBottom: "15px",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {postImage ? (
                    <>
                      <img
                        src={postImage}
                        alt="Event"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "5px"
                        }}
                      />
                      <button
                        onClick={handleRemoveEventImage}
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          backgroundColor: "red",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          padding: "5px 10px",
                          cursor: "pointer",
                          fontSize: "0.9rem"
                        }}
                      >
                        Remove Image
                      </button>
                    </>
                  ) : (
                    <div>
                      <p style={{ marginBottom: "8px" }}>Upload an image</p>
                      <input
                        type="file"
                        accept="image/*"
                        ref={eventImageRef}
                        onChange={handlePostImageUpload}
                        style={{ color: "#fff", cursor: "pointer" }}
                      />
                    </div>
                  )}
                </div>
                <div>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={isEvent}
                    onChange={() => setIsEvent(!isEvent)}
                    style={{
                      width: "18px",
                      height: "18px",
                      accentColor: "#1f2a38",
                      cursor: "pointer"
                    }}
                  />
                  <span style={{ fontSize: "16px", color: "#fff" }}>Create an event</span>
                </label>

                </div>
                {isEvent && (
                  <>
                <input
                  type="text"
                  placeholder="Event Name"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  style={formInputStyle}
                />
                <textarea
                  placeholder="Event Description"
                  value={eventDetails}
                  onChange={(e) => setEventDetails(e.target.value)}
                  style={{ ...formInputStyle, resize: "vertical", height: "80px" }}
                />
                <input
                  type="date"
                  placeholder="Event date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  style={formInputStyle}
                />
                <input
                  type="time"
                  placeholder="hh:mm --"
                  value={eventStartTime}
                  onChange={(e) => setEventStartTime(e.target.value)}
                  style={formInputStyle}
                />
                <input
                  type="time"
                  placeholder="hh:mm --"
                  value={eventEndTime}
                  onChange={(e) => setEventEndTime(e.target.value)}
                  style={formInputStyle}
                />
                
                <LocationSearchBar setEventLocation_displayName={setEventLocation_displayName} setEventLocation_latitude={setEventLocation_latitude} setEventLocation_longitude={setEventLocation_longitude}/>

                <input
                  type="text"
                  placeholder="Max Participants"
                  value={eventMaxParticipants}
                  onChange={(e) => setEventMaxParticipants(e.target.value)}
                  style={formInputStyle}
                />
                <select
                  value={eventIsPublic}
                  onChange={(e) => setEventIsPublic(e.target.value)}
                  style={formSelectStyle}
                >
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
                <input
                  type="text"
                  placeholder="Ticket Price"
                  value={eventTicketPrice}
                  onChange={(e) => setEventTicketPrice(e.target.value)}
                  style={formInputStyle}
                />
                </>
                )}

                {/* Buttons */}
                <button onClick={() => {handlePostCreation(); setReloadClubProfile(prevState => !prevState);}} style={formButtonStyle}>
                  {isEvent ? "Add Event" : "Add Post"}
                </button>
                <button
                  onClick={() => setCreatingPost(false)}
                  style={{ ...formButtonStyle, backgroundColor: "#ccc", color: "#000" }}
                >
                  Cancel
                </button>
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
    );
};

export default PostForm;

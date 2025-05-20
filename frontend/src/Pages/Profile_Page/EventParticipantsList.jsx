import React, { useEffect, useState } from "react";
import { get_event_participants } from "./clubprofile_requests";

const styles = {
  container: {
    maxWidth: '800px',
    margin: '40px auto',
    padding: '0 20px',
    fontFamily: 'Arial, sans-serif',
  },
  backButton: {
    marginBottom: '16px',
    padding: '8px 16px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
    transition: 'background-color 0.2s ease',
  },
  backButtonHover: {
    backgroundColor: '#e0e0e0',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '24px',
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    transition: 'box-shadow 0.2s ease-in-out',
  },
  cardHover: {
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    flexBasis: '30%',
  },
  profilePic: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginRight: '12px',
    border: '1px solid #ccc',
  },
  username: {
    fontWeight: '500',
    color: '#555',
  },
  center: {
    flexBasis: '30%',
    textAlign: 'center',
    fontWeight: '600',
    color: '#222',
  },
  right: {
    flexBasis: '30%',
    textAlign: 'right',
    color: '#777',
    fontSize: '14px',
  },
};

const EventParticipantsList = ({ eventID, setViewingEvent }) => {
  const [eventParticipants, setEventParticipants] = useState([]);
  const [isHoveringBack, setIsHoveringBack] = useState(false);

  useEffect(() => {
    const loadEventParticipants = async () => {
      try {
        const result = await get_event_participants(eventID);
        if (result.success) {
          setEventParticipants(result.data);
        } else {
          console.log(result.message);
        }
      } catch (error) {
        console.error("Error fetching event participants:", error);
      }
    };

    loadEventParticipants();
  }, []);

  return (
    <div style={styles.container}>
      <button
        style={{
          ...styles.backButton,
          ...(isHoveringBack ? styles.backButtonHover : {}),
        }}
        onClick={() => setViewingEvent(null)}
        onMouseEnter={() => setIsHoveringBack(true)}
        onMouseLeave={() => setIsHoveringBack(false)}
      >
        ← Back
      </button>

      <h2 style={styles.title}>Event Participants</h2>
      {eventParticipants.map((participant, index) => (
        <div
          key={index}
          style={styles.card}
          onMouseEnter={e =>
            (e.currentTarget.style.boxShadow = styles.cardHover.boxShadow)
          }
          onMouseLeave={e =>
            (e.currentTarget.style.boxShadow = styles.card.boxShadow)
          }
        >
          <div style={styles.left}>
            <img
              src={participant.profilePicUrl}
              alt={participant.username}
              style={styles.profilePic}
            />
            <span style={styles.username}>@{participant.username}</span>
          </div>

          <div style={styles.center}>
            {participant.firstname} {participant.familyname}
          </div>

          <div style={styles.right}>
            {participant.email}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventParticipantsList;

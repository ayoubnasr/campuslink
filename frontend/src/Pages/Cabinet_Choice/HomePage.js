import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../static/Cabinet_Choice/Cabinet_Choice.css";

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");

    // 🔹 Auto-redirect Student users to Student Page
    if (userRole === "student") {
      navigate("/student");
    }
  }, [navigate]);

  return (
    <div className="cabinet-page">
      <h1>WELCOME TO THE EVENT APP!</h1>

      {/* ✅ Button Wrapper */}
      <div className="event-list">
        <button className="event-form button" onClick={() => navigate("/cabinet")}>
          Create Event
        </button>
        <button className="event-form button" onClick={() => navigate("/student")}>
          Upcoming Events
        </button>
      </div>
    </div>
  );
};

export default HomePage;

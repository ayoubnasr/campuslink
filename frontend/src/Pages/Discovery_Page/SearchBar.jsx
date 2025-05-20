import { useState, useEffect } from "react";
import "./SearchBarStyle.css";
import { sidebarStyle } from "../Home_Page/StudentHomePageStyle.jsx";
import { request_get_accounts, request_follow_account } from "./discovery_requests";

export default function SearchBar({setHomeActiveTab, setClubViewCRN}) {
  const [searchPhrase, setSearchPhrase] = useState("");
  const [followedClubs, setFollowedClubs] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const toggleFollow = async (club) => {

    setError('');

    setFollowedClubs(prevFollowedClubs => {
      // Check if the club is already followed
      const isAlreadyFollowed = prevFollowedClubs.some(c => c.club_crn === club.club_crn);
  
      if (isAlreadyFollowed) {
        // Remove it (unfollow)
        return prevFollowedClubs.filter(c => c.club_crn !== club.club_crn);
      } else {
        // Add it (follow)
        return [...prevFollowedClubs, club];
      }
    });

    
    const follow_request = await request_follow_account(club.club_crn);

    if (!follow_request.success){
      setFollowedClubs(prevFollowedClubs => {
        // Check if the club is already followed
        const isAlreadyFollowed = prevFollowedClubs.some(c => c.club_crn === club.club_crn);
    
        if (isAlreadyFollowed) {
          // Remove it (unfollow)
          return prevFollowedClubs.filter(c => c.club_crn !== club.club_crn);
        } else {
          // Add it (follow)
          return [...prevFollowedClubs, club];
        }
      });

      setError(follow_request.message);
    }

  };

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchPhrase.trim() === "") {
        setSearchResults([]);
        return;
      }

      const request_result = await request_get_accounts(searchPhrase);
      if (!request_result.success) {
        setError(request_result.message);
        setMessage("");
      } else {
        setSearchResults(request_result.result);
        setError("");

        //Need to set club follows:
        setFollowedClubs(() => {
            return request_result.result.filter(club => club.follow_status === "Followed");
        });

      }
    }, 300); // Debounce: Wait 300ms before sending request

    return () => clearTimeout(delaySearch); // Cleanup function to prevent unnecessary calls
  }, [searchPhrase]);

  return (
    <div className="follow-container">
  <div>
    <h2>Search</h2>
    <input
      type="text"
      placeholder="Search for a club..."
      value={searchPhrase}
      onChange={(e) => setSearchPhrase(e.target.value)}
      className="input"
    />
    {error && <p className="error">{error}</p>}
    {message && <p className="message">{message}</p>}
    
    <div className="results-container">
    {searchResults.map((club) => (
      <div key={club.club_crn} className="account-item">
        <img
          style={{ width: "40px", height: "40px", borderRadius: "50%" }}
          src={club.club_profile_pic_url}
          alt="Profile"
          onError={(e) => {
            e.target.onerror = null; // prevents looping if fallback fails
            e.target.src = "/images/user_pfp.png";
          }}
        />

        
        <div 
          className="account-details" 
          style={{ cursor: "pointer" }} 
          onClick={() => {
            setHomeActiveTab("profileView");
            setClubViewCRN(club.club_crn);
          }}
        >
          <span className="club-title">{club.club_title}</span><br />
          <span className="club-crn">{club.club_crn}</span>
        </div>
      </div>
    ))}

    </div>
  </div>
</div>

  );
}

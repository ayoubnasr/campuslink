import React, { useState, useEffect, useRef } from "react";
import {
  FaCalendarAlt,
  FaUsers,
  FaUser,
  FaSignOutAlt,
  FaPen,
  FaPlus,
  FaHome,
  FaSearch,
  FaFile,
  FaFileAlt,
  FaRegNewspaper,
  FaCompass
} from "react-icons/fa";

import {HomePageStyle, sidebarStyle, searchbarStyle, profileStyle, profileImageStyle, buttonContainerStyle,
  buttonStyle, activeButtonStyle, logoutButtonStyle, contentStyle, universityBannerStyle,
  profileCardWrapperStyle, profileCardStyle, profileCardImageContainer, editIconStyle, profileCardImageStyle,
  profileCardNameStyle, profileCardRoleStyle, profileCardDescriptionStyle, profileCardButtonStyle} from './StudentHomePageStyle.jsx'

import { get_user_authorization_info, get_user_profile } from "./homepage_requests.js";
import ForYouPage from "./ForYouPage.jsx";
import SearchBar from "../Discovery_Page/SearchBar.jsx";
import ProfileEditorPage from "../Profile_Page/ProfileEditorPage.jsx";
import ProfileViewerPage from "../Profile_Page/ProfileViewerPage.jsx";

const StudentHomePage = () => {
  // Tabs: "events", "members", "profile"
  const [activeTab, setActiveTab] = useState("clubposts");
  const [searchActive, setSearchActive] = useState(false);
  const [showText, setShowText] = useState(false);

  const [clubViewCRN, setClubViewCRN] = useState(null);

  //Error and warning messages:
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");


  const sideBar_showText_delay = 700;

  useEffect(() => {
    if (!searchActive) {
      // Delay showing sidebar text by 500ms
      const timeout = setTimeout(() => setShowText(true), sideBar_showText_delay);
      return () => clearTimeout(timeout); // Cleanup timeout on unmount
    } else {
      setShowText(false);
    }
  }, [searchActive]);


  const [userInfo, setUserInfo] = useState(null);
  const [isCabinet, setIsCabinet] = useState(false);

  useEffect(() => {

    const fetchUserInfo = async () => {

      try {
        const userInfo_result = await get_user_authorization_info();

        if (userInfo_result.success){
          setUserInfo(userInfo_result.user);
        }
        else {
          setUserInfo(null);
          console.log(userInfo_result.message);
        }

      }
      catch (error){
        console.error("Error fetching user info:", error);
      }

    }

    fetchUserInfo();

  }, []);


  useEffect(() => {

    if (userInfo){
      if (userInfo.role === 'cabinet'){
        setIsCabinet(true);
      }
      else {
        setIsCabinet(false);
      }
    }

  }, [userInfo]);
  


  const [userName, setUserName] = useState("N/A");
  const [userProfPicURL, setUserProfPicURL] = useState("");
  const [userBio, setUserBio] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {

    const fetchUserProfile = async () => {
      try {
        // TODO: Cache user details (use Redis)
        const result = await get_user_profile();

        if (result.success){
          
          const profile = result.profile;
          const { username, email, profile_pic_url, bio } = profile;
          
          setUserName(username);
          setUserProfPicURL(profile_pic_url);
          setUserBio(bio);
          setUserEmail(email);
        }
        else {
          console.log(result.message);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
  
    fetchUserProfile();

  }, []);

  /** ===== LOGOUT HANDLER ===== */
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      // Redirect to login
      window.location.href = "/login"; 
    }
  };

  return (
    <div style={HomePageStyle}>
      {/* SIDEBAR */}
      <div style={sidebarStyle(!searchActive)}>
        <div style={profileStyle}>
          <img
            src={userProfPicURL ? userProfPicURL : "/images/user_pfp.png"}
            alt="Club"
            style={profileImageStyle(!searchActive)}
          />
          <h3>{userName}</h3>
        </div>
        <div style={buttonContainerStyle}>
          <button
            style={activeTab === "home" ? activeButtonStyle : buttonStyle}
            onClick={() => {setActiveTab("home"); setSearchActive(false)}}
          >
            <FaHome size={28} /> {showText ? "Home" : ""}
          </button>

          <button
            style={searchActive? activeButtonStyle : buttonStyle}
            onClick={() => setSearchActive(!searchActive)}
          >
            <FaSearch size={28} /> {showText ? "Search" : ""}
          </button>

          <button
            style={activeTab === "explore" ? activeButtonStyle : buttonStyle}
            onClick={() => {setActiveTab("explore"); setSearchActive(false)}}
          >
            <FaCompass size={28} /> {showText ? "Explore" : ""}
          </button>

          { isCabinet && (
            <>
              <button
                style={activeTab === "clubprofile" ? activeButtonStyle : buttonStyle}
                onClick={() => {setActiveTab("clubprofile"); setSearchActive(false)}}
              >
                <FaUser size={28} /> {showText ? "Club Profile" : ""}
              </button>
            </>
          )}
          <button style={logoutButtonStyle} onClick={handleLogout}>
            <FaSignOutAlt size={28} /> {showText ? "Logout" : ""}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={contentStyle}>

        {activeTab === "home" && (

          <ForYouPage />

        )}

        
          <div style={searchbarStyle(searchActive)}>
            <SearchBar setHomeActiveTab={setActiveTab} setClubViewCRN={setClubViewCRN} />
          </div>


        {activeTab === "profileView" && <ProfileViewerPage target_club_crn={clubViewCRN} />}

        {activeTab === "clubprofile" && <ProfileEditorPage target_club_crn={userInfo.club_crn} />}
      </div>
    </div>
  );
};

export default StudentHomePage;

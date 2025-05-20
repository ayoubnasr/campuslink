import React, { useState, useEffect, useRef } from "react";
import { FaUserPlus, FaCog, FaTh, FaPlay, FaBookmark, FaPlus, FaToolbox, FaPen, FaTools, FaCalendarAlt } from "react-icons/fa";
import { get_club_profile, get_club_posts } from "./clubprofile_requests.js";

import PostForm from "../Post_Creation/PostCreation.jsx";

import {
  profileContainerStyle,
  profileHeaderStyle,
  profilePictureStyle,
  topRowStyle,
  followButtonStyle,
  settingsIconStyle,
  statsStyle,
  bioStyle,
  tabsStyle,
  tabButtonStyle,
  postsGridStyle,
  postImageStyle,
  eventCardStyle,
  eventImageStyle,
  titleStyle,
  dateStyle
} from './ProfilePageStyle.jsx'
import ProfileEditorForm from "../ProfileEditorForm/ProfileEditorForm.jsx";
import { request_follow_account } from "../Discovery_Page/discovery_requests.js";
import PostViewPage from "../PostViewPage/PostViewPage.jsx";
import EventParticipantsList from "./EventParticipantsList.jsx";

const ProfileEditorPage = ({target_club_crn}) => {
  const [activeTab, setActiveTab] = useState("posts");

  const [clubName, setClubName] = useState("Alloosh");
  const [clubPhotoURL, setClubPhotoURL] = useState(null);
  const [clubEmail, setClubEmail] = useState("");
  const [clubBio, setClubBio] = useState("");
  const [clubPostCount, setClubPostCount] = useState(0);
  const [clubEventCount, setClubEventCount] = useState(0);
  const [clubFollowerCount, setClubFollowerCount] = useState(0);
  
  const [posts, setPosts] = useState([]);
  
  const [toolsOpen, setToolsOpen] = useState(false);

  const [creatingPost, setCreatingPost] = useState(false);

  const [viewingPost, setViewingPost] = useState(false);

  const [viewingEvent, setViewingEvent] = useState(null);
  
  const [editingProfile, setEditingProfile] = useState(false);

  const [reloadClubProfile, setReloadClubProfile] = useState(false);

  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {

    const fetchClubProfile = async () => {
      try {

        // TODO: Cache club details (use Redis)
        const result = await get_club_profile(target_club_crn);

        if (result.success){
          
          const profile = result.profile;
          const { club_title, club_email, club_profile_pic_url, club_bio, club_userFollowing, club_post_count, club_event_count } = profile;
          
          setClubName(club_title);
          setClubBio(club_bio);
          setClubEmail(club_email);
          setClubPhotoURL(club_profile_pic_url);
          setIsFollowing(club_userFollowing);
          setClubPostCount(club_post_count);
          setClubEventCount(club_event_count);
        }
        else {
          console.log(result.message);
        }
      } catch (error) {
        console.error("Error fetching club profile:", error);
      }
    };
  
    fetchClubProfile(); // Call the async function

  }, [reloadClubProfile, target_club_crn]);

  // On mount, try to load club profile details from database:
    useEffect(() => {
      //TODO: Cache some of the club's events
      //TODO: Load club's events as the user scrolls
      //If active tab is events, load the club's events from database:
      if (activeTab === 'posts'){
  
        //Load posts from database:
        const fetchClubPosts = async () => {
  
          try {
  
            const result = await get_club_posts(target_club_crn);
    
            if (result.success){
              const res_posts = result.posts;
              
              setPosts(res_posts);
  
            }
            else {
                console.error(result.message);
            }
          } catch (error) {
            console.error("Error fetching club posts:", error);
          }
  
        };
  
        fetchClubPosts();
      }
    
    }, [target_club_crn]);

    const handleFollow = async () => {

      const follow_request = await request_follow_account(target_club_crn);

      if (!follow_request.success){
        console.log("Error while sending follow request to server: ", follow_request);
        return;
      }

      setIsFollowing(!isFollowing);

    };

  return (
    <div style={{ position: "relative", paddingBottom: "80px", maxHeight: "100vh"}}>
    {creatingPost ? 
    <PostForm setCreatingPost={setCreatingPost} setPosts={setPosts} posts={posts} setReloadClubProfile={setReloadClubProfile} />
    : (editingProfile)?
      <ProfileEditorForm setEditingProfile={setEditingProfile} setReloadClubProfile={setReloadClubProfile} initial_club_title={clubName} initial_club_bio={clubBio} initial_club_Email={clubEmail} initial_club_profile_photo_url={clubPhotoURL} />
    :
    (viewingPost)?
      <PostViewPage post={viewingPost} setViewingPost={setViewingPost}/>
    :
    (viewingEvent)?
      <EventParticipantsList eventID={viewingEvent} setViewingEvent={setViewingEvent} />
    :
    (

      <>

      <div style={profileContainerStyle}>
      {/* Profile Header */}
      <div style={profileHeaderStyle}>
        <img style={profilePictureStyle} src={clubPhotoURL} alt="Profile" />
        <div>
          <div style={topRowStyle}>
            <h2>{clubName}</h2>
            <button style={followButtonStyle(isFollowing)} onClick={handleFollow}>
              {( ! isFollowing)?"Follow" : "Unfollow"}
            </button>
            <FaCog style={settingsIconStyle} />
          </div>
          <div style={statsStyle}>
            <span><strong>{clubPostCount}</strong> posts</span>
            <span><strong>{clubEventCount}</strong> events</span>
            <span><strong>{clubFollowerCount}</strong> followers</span>
          </div>
          <p style={bioStyle}>{clubBio}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={tabsStyle}>
        <button style={tabButtonStyle(activeTab === "posts")} onClick={() => setActiveTab("posts")}>
          <FaTh /> POSTS
        </button>
        <button style={tabButtonStyle(activeTab === "events")} onClick={() => setActiveTab("events")}>
          <FaCalendarAlt /> Events
        </button>
        <button style={tabButtonStyle(activeTab === "saved")} onClick={() => setActiveTab("saved")}>
          <FaBookmark /> TAGGED
        </button>
      </div>

      {/* Content Grid */}
      <div style={postsGridStyle}>
        {activeTab === "posts" && 
          posts.map((post, index) => (
          <img key={index} src={post.post_image_url} alt="Post" style={postImageStyle} onClick={() => {setViewingPost(post);}} />
        ))}

        {activeTab === "events" && 
          posts.map((post, index) => 
          {
            if (post.is_event)
              return (
                <div style={eventCardStyle} onClick={() => {setViewingEvent(post.event_id); console.log("Event ID: ", post.event_id)}}>
                  <div style={eventImageStyle}>
                    <img key={index} src={post.post_image_url} alt="img" style={postImageStyle}/>
                  </div>
                  <p style={titleStyle}>{post.event_title}</p>
                  <p style={dateStyle}>{post.event_date}</p>
                  <p style={dateStyle}>Participation: {post.event_participant_count || 0}</p>
                </div>
              )
          }
        )}
      </div>      
    </div>

    
    <div style={{
      display: "flex",
      flexDirection: "column",
      position: "fixed",  
      bottom: "10px",     
      right: "10px",      
      backgroundColor: "#fff",
      borderTopLeftRadius: "50px",
      borderTopRightRadius: "50px",
      borderBottomLeftRadius: "50px",
      borderBottomRightRadius: "50px",
      padding: "10px",
      gap: "5px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.3)", 
      }}>
    
      {toolsOpen && (
        <>
          <div
              style={{
                position: "relative",       
                backgroundColor: "#fff",
                borderRadius: "50%",
                padding: "10px",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
              }}
              onClick={() => {setCreatingPost(true); setEditingProfile(false);}}
            >
              <FaPlus color="#1f2a38" size={38} />
            </div>

            <div
              style={{
                position: "relative",  
                backgroundColor: "#fff",
                borderRadius: "50%",
                padding: "10px",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
              }}
              onClick={() => {setEditingProfile(true); setCreatingPost(false);}}
            >
              <FaPen color="#1f2a38" size={38} />
            </div>
        </>
        )}

      <div
        style={{
          position: "relative",    
          backgroundColor: "#fff",
          borderRadius: "50%",
          padding: "10px",
          cursor: "pointer",
          boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
        }}
        onClick={() => setToolsOpen(!toolsOpen)}
      >
        <FaTools color="#1f2a38" size={38} />
      </div>

    </div>

    
      
      </>
    )}
    </div>
  );
}


export default ProfileEditorPage;

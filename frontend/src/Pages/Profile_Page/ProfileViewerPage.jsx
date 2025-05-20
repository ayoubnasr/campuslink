import React, { useState, useEffect, useRef } from "react";
import { FaUserPlus, FaCog, FaTh, FaPlay, FaBookmark, FaPlus, FaToolbox, FaPen, FaTools } from "react-icons/fa";
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
} from './ProfilePageStyle.jsx'
import ProfileEditor from "../ProfileEditorForm/ProfileEditorForm.jsx";
import { request_follow_account } from "../Discovery_Page/discovery_requests.js";
import PostViewPage from "../PostViewPage/PostViewPage.jsx";

const ProfileViewerPage = ({target_club_crn}) => {
  const [activeTab, setActiveTab] = useState("posts");

  const [clubName, setClubName] = useState("Alloosh");
  const [clubPhotoURL, setClubPhotoURL] = useState("/images/user_pfp.png");
  const [clubEmail, setClubEmail] = useState("");
  const [clubBio, setClubBio] = useState("");
  const [clubPostCount, setClubPostCount] = useState(0);
  
  const [posts, setPosts] = useState([]);
  
  const [toolsOpen, setToolsOpen] = useState(false);

  const [creatingPost, setCreatingPost] = useState(false);

  const [viewingPost, setViewingPost] = useState(null);

  const [reloadClubProfile, setReloadClubProfile] = useState(false);

  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {

    const fetchClubProfile = async () => {
      try {

        // TODO: Cache club details (use Redis)
        const result = await get_club_profile(target_club_crn);

        if (result.success){
          
          const profile = result.profile;
          const { club_title, club_email, club_profile_pic_url, club_bio, club_userFollowing, club_post_count } = profile;
          
          setClubName(club_title);
          setClubBio(club_bio);
          setClubEmail(club_email);
          setClubPhotoURL(club_profile_pic_url);
          setIsFollowing(club_userFollowing);
          setClubPostCount(club_post_count);
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
    <PostForm setCreatingPost={setCreatingPost} setPosts={setPosts} posts={posts} />
    :
    (viewingPost)?
      <PostViewPage post={viewingPost} setViewingPost={setViewingPost}/>
    :
    (
      <>
      <div style={profileContainerStyle}>
      {/* Profile Header */}
      <div style={profileHeaderStyle}>
      <img
        style={profilePictureStyle}
        src={clubPhotoURL}
        alt="Profile"
        onError={(e) => {
          e.target.onerror = null; // prevents looping if fallback fails
          e.target.src = "/images/user_pfp.png";
        }}
      />
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
            <span><strong>122</strong> events</span>
            <span><strong>5.2k</strong> followers</span>
          </div>
          <p style={bioStyle}>{clubBio}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={tabsStyle}>
        <button style={tabButtonStyle(activeTab === "posts")} onClick={() => setActiveTab("posts")}>
          <FaTh /> POSTS
        </button>
        <button style={tabButtonStyle(activeTab === "reels")} onClick={() => setActiveTab("reels")}>
          <img src="/images/tape.png" style={{width: "24px"}} /> Memories
        </button>
        <button style={tabButtonStyle(activeTab === "saved")} onClick={() => setActiveTab("saved")}>
          <FaBookmark /> TAGGED
        </button>
      </div>

      {/* Content Grid */}
      <div style={postsGridStyle}>
        {activeTab === "posts" && posts.map((post, index) => (
            <img key={index} src={post.post_image_url} alt="Post" style={postImageStyle} onClick={() => {setViewingPost(post);}} />
        ))}
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

    </div>

    
      
      </>
    )}
    </div>
  );
}


export default ProfileViewerPage;

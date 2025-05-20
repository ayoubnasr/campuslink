import {
    FaCalendarAlt,
    FaUsers,
    FaMapMarkerAlt,
    FaHeart,
    FaShare,
    FaComment,
    FaFire,
    FaLock,
    FaLockOpen,
    FaDollarSign
  } from "react-icons/fa";

import {postViewContainerStyle} from './PostViewPageStyle.jsx';


import { useEffect, useState } from "react";
import PostFrame from "../PostFrame/PostFrame.jsx";


const PostViewPage = ({ post, setViewingPost }) => {
    return (
        <div style={{ ...postViewContainerStyle, position: 'relative' }}>
            
            {/* Back Button */}
            <button
                onClick={() => setViewingPost(null)}
                style={{
                    position: 'fixed',
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    marginLeft: "-110px",
                    zIndex: 10
                }}
            >
                ← Back
            </button>

            <PostFrame post={post} />

        </div>
    );
};




export default PostViewPage;
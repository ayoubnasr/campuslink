import React, { useState, useEffect } from "react";
import { getUserFeed } from "./homepage_requests.js";
import { useNavigate } from 'react-router-dom';
import PostList from "./PostList.jsx";

const ForYouPage = () => {


    const navigate = useNavigate();


    const [activeTab, setActiveTab] = useState("foryou");

    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(false);

    
    const [showModal, setShowModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);


    const [userfeed, setUserFeed] = useState([]);
    

    async function fetchUserFeed() {
        const result = await getUserFeed(page);
    
        // Make sure we're not adding posts already added before
        if (result.success && result.feed.length > 0) {
            setUserFeed(prevFeed => {
                // Filter out any posts that already exist in the current feed
                const newPosts = result.feed.filter(post => 
                    !prevFeed.some(existingPost => existingPost.post_id === post.post_id)
                );
                
                // Return the updated state with the new posts
                return [...prevFeed, ...newPosts];
            });
        }
    }

    useEffect(() => {

        fetchUserFeed();

    }, []);

    useEffect(() => {

        //Handle scrolling:
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
                setPage(prevPage => prevPage + 1);
            }
        };

        console.log("page: " + page);

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div>
            {userfeed.length === 0 ? (
                <p>Sorry, we can't find you feed at the moment.</p>
            ) : (
                <PostList posts={userfeed} />

            )}
        </div>
    );
};

export default ForYouPage;

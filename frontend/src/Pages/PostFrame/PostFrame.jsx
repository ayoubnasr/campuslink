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

import {timelineContainerStyle, eventCardStyle, eventHeaderStyle, 
    postCardStyle, postDetailsContainerStyle, postHeaderStyle, postClubIconStyle, postTitleStyle, postButtonStyle,
    postDetailsStyle, eventInfoRow, eventIconStyle, eventRegistrationButton, eventFooter, actionBarStyle } from '../Home_Page/StudentHomePageStyle.jsx';


import { useEffect, useState } from "react";


import AnimatedButton from "../AnimatedButton/AnimatedButton.jsx";
import { preloadImageFrames } from '../../LogicModules/PreloadingModules/DataPreloadingFunctions.js';
import { register_user, unregister_user } from "./registration_requests.js";




const PostFrame = ({post, preloadedHypeButtonImages_parent}) => {

    const HypeButtonAnimation_FrameCount = 16;
    const [preloadedHypeButtonImages, setPreloadedHypeButtonImages] = useState(preloadedHypeButtonImages_parent);
    const [preloadingDone, setPreloadingDone] = useState(false);

    const [isRegistered, setIsRegistered] = useState(post.is_event_registered);

    useEffect(() => {

        if (!preloadedHypeButtonImages_parent){

            const preloadResult = preloadImageFrames('/HypeButton_Animation', HypeButtonAnimation_FrameCount);

            setPreloadedHypeButtonImages(preloadResult);
        }
        else {
            setPreloadedHypeButtonImages(preloadedHypeButtonImages_parent);
        }

        setPreloadingDone(true);

    }, []);

    const handleEventRegistration = async () => {
        try {
            if (!isRegistered){
                const reg_result = await register_user(post.event_id);
                
                if (reg_result.success === false){
                    console.log(reg_result.message);
                }

                setIsRegistered(!isRegistered);
            }
            else {
                const reg_result = await unregister_user(post.event_id);
                
                if (reg_result.success === false){
                    console.log(reg_result.message);
                }

                setIsRegistered(!isRegistered);
            }
        }
        catch (err){
            console.log("Error while registering to event: ", err);
        }
    };

    return ( preloadingDone &&
        <>
        <div style={postCardStyle} key={post.post_id}>
            <div style={postHeaderStyle}>
                {post.club_profile_pic_url &&
                    <img
                    src={post.club_profile_pic_url || "/images/user_pfp.png"}
                    alt="pfp"
                    style={postClubIconStyle}
                    onError={(e) => {
                      e.target.onerror = null; // Prevent infinite loop in case the fallback image also fails
                      e.target.src = "/images/user_pfp.png"; // Fallback to default image
                    }}
                  />
                  
                }
                {post.club_title &&
                    <div style={postTitleStyle}>{post.club_title}</div>
                }
            </div>

            <div style={postDetailsContainerStyle}>
                <div style={postTitleStyle}>{post.post_title}</div>
                
                <p style={postDetailsStyle}>{ (post.post_details)?(post.post_details):"" }</p> 
            </div>

            

            {post.post_image_url && (
                <img
                    src={post.post_image_url}
                    alt="Event"
                    style={{
                        width: "100%",
                        marginTop: "10px",
                        marginBottom: "10px"
                    }}
                />
            )}

            
            {/*Event Card*/}
            {Boolean(post.is_event) && (
                <div style={eventCardStyle}>
                    <div style={eventInfoRow}>
                        <FaCalendarAlt style={eventIconStyle} />
                        {post.event_date}
                    </div>
                    <div style={{display:"flex", flexDirection:"column"}}>
                        <div style={eventInfoRow}>
                            <FaMapMarkerAlt style={eventIconStyle} />
                            {post.event_location_name}
                        </div>
                        <div style={eventInfoRow}>
                            {(post.event_location_latitude && post.event_location_longitude) && (
                                <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(post.event_location_name)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={postButtonStyle}
                                >
                                View on Map
                                </a>
                            )}
                        </div>
                    </div>
                    
                    <div style={{display:"flex", flexDirection:"row", gap:"20px"}}>
                        <div style={eventInfoRow}>
                            <FaUsers style={eventIconStyle} />
                            Max: {post.event_max_participation}
                        </div>

                        <div style={eventInfoRow}>

                            {post.event_exclusive ? (
                                <>
                                    <FaLock style={eventIconStyle} />
                                    <span>Private</span>
                                </>
                            )
                            :
                            (
                                <>
                                    <FaLockOpen style={eventIconStyle} />
                                    <span>Public</span>
                                </>
                            )
                            }
                        </div>

                        <div style={eventInfoRow}>
                            <FaDollarSign style={eventIconStyle} />
                            Price: {post.event_ticket_price}
                        </div>
                    </div>

                    <div style={eventFooter}>

                    <button
                    style={{
                        ...eventRegistrationButton,
                        backgroundColor: isRegistered ? '#ffffff' : eventRegistrationButton.backgroundColor,
                        color: isRegistered ? '#333' : eventRegistrationButton.color,
                        border: isRegistered ? '1px solid #ccc' : eventRegistrationButton.border,
                    }}
                    onClick={handleEventRegistration}
                    >
                    {isRegistered ? 'Unregister' : 'Register'}
                    </button>


                    </div>

                </div>
            )}


            <div style={actionBarStyle}>
                
                <AnimatedButton  images_array={preloadedHypeButtonImages} buttonWidth="50px" buttonHeight="50px"/>

                <button style={{borderRadius: "50%", border: "none", width:"50px", height:"50px", backgroundColor: "white", justifyContent: "center", alignItems: "center"}}>
                    <FaComment />
                </button>
            </div>
            
        </div>

        </>
    );
}



export default PostFrame;

import {timelineContainerStyle, timelineContainerScrollbarStyle} from './StudentHomePageStyle.jsx';
import { useEffect, useState } from "react";
import PostFrame from "../PostFrame/PostFrame.jsx";
import { preloadImageFrames } from "../../LogicModules/PreloadingModules/DataPreloadingFunctions.js";

const PostList = ({posts}) => {

    const HypeButtonAnimation_FrameCount = 16;
    const [preloadedHypeButtonImages, setPreloadedHypeButtonImages] = useState([]);


    useEffect(() => {

        const preloadResult = preloadImageFrames('/HypeButton_Animation', HypeButtonAnimation_FrameCount);

        setPreloadedHypeButtonImages(preloadResult);
        
        
    }, []);

    return (
        <div style={{...timelineContainerStyle, ...timelineContainerScrollbarStyle}}>
            {preloadedHypeButtonImages.length > 0 && //Make sure to render only after preloading
                posts.map((post) => ( 

                    <PostFrame key={post.post_id} post={post} preloadedHypeButtonImages_parent={preloadedHypeButtonImages}/>
                ))
            }
        </div>

    );
};

export default PostList;
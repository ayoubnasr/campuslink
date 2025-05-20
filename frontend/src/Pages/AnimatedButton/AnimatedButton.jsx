import React, { useState, useEffect, useRef } from "react";

import { buttonStyle, imageStyle } from "./AnimatedButtonStyle";


const AnimatedButton = ({frames_folder_path, images_array, buttonWidth = "50px", buttonHeight = "50px"}) => {

    const [isAnimating, setIsAnimating] = useState(false);
    const [frame, setFrame] = useState(0);
    const totalFrames = 16;
    const frameRate = 60;

    const handleButtonClick = () => {
        setIsAnimating(true);
    }

    useEffect(() => {

        if (!isAnimating) return;

        const interval = setInterval(() => {

            setFrame(prevFrame => {
                if (prevFrame === totalFrames - 1){
                    clearInterval(interval);
                    //setIsAnimating(false);
                    return totalFrames - 1;
                }

                return prevFrame + 1;
            });
        }, frameRate);

        return () => clearInterval(interval);

    }, [isAnimating, totalFrames]);


    return (
        <button onClick={handleButtonClick} style={{...buttonStyle, width: buttonWidth, height: buttonHeight}}>
            <img
                key={frame}
                src={
                    //requires the image objects in the image array to have a src field that represents their path
                    images_array ? images_array[frame].src : `${frames_folder_path}/frame${frame.toString().padStart(4, "0")}.png`
                }
                onError={(e) => {
                    e.target.onerror = null; // prevents looping if fallback fails
                    e.target.src = "";
                }}
                alt="Hype up!"
                style={imageStyle}
                onContextMenu={(e) => e.preventDefault()} // Disables right-click menu
                draggable="false" // Prevents dragging behavior
            />
        </button>

    );

};


export default AnimatedButton;
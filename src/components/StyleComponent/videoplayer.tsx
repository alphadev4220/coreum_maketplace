import React, { useEffect, useRef } from 'react';

const VideoPlayer = ({ onClose }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        // Play the video as soon as the component loads
        const videoElement = videoRef.current;
        if (videoElement) {
            videoElement.play();
        }
    }, []);

    const onVideoEnd = () => {
        // Navigate to the next page after the video ends
        onClose();
        window.location.href = 'https://sologenic.org/bridge';
    };

    return (
        <video
            ref={videoRef}
            onEnded={onVideoEnd}
            width="80%"
            height="80%"
            muted
            autoPlay
            style={{ zIndex: 0 }}
        >
            <source src="/images/content/bridge_video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
        </video>
    );
};

export default VideoPlayer;

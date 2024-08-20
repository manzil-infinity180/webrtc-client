import { useEffect, useRef } from "react";

export function Video({stream}) {
    const videoStream = useRef(null);
    useEffect(() => {
        if(videoStream && videoStream.current){
            videoStream.current.srcObject = stream
        }
    },[videoStream, stream]);
    return (
        <div>
            <video style={{borderRadius: 10, width:"40%", height:"40%"}} ref={videoStream} muted autoPlay={true} playsInline={true}
            />
        </div>
    );
}


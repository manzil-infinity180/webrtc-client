import { useEffect, useRef } from "react";

export function Video({stream, muted=true,width='25%',height='25%', controls=false}) {
    const videoStream = useRef();
    useEffect(() => {
        if(videoStream && videoStream.current){
            console.log(videoStream.current);
            videoStream.current.srcObject = stream
        }
    },[videoStream, stream]);
    return (
        <>
        {console.log(stream)}
        {stream && <>
            <video style={{borderRadius: 10, width:width, height:height, margin:'4px'}} ref={videoStream} 
            muted={muted} autoPlay={true} playsInline={true}
            controls={controls} className="video_hai"/>
        </>
        }
        </>
    );
}


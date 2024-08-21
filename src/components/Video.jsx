import { useEffect, useRef } from "react";

export function Video({stream, muted=true,width='40%',height='40%', controls=false}) {
    const videoStream = useRef();
    useEffect(() => {
        if(videoStream && videoStream.current){
            videoStream.current.srcObject = stream
        }
    },[videoStream, stream]);
    return (
        <>
        {console.log(stream)}
        {stream && <div>
            <video style={{borderRadius: 10, width:width, height:height}} ref={videoStream} 
            muted={muted} autoPlay={true} playsInline={true}
            controls={controls} />
        </div>
        }
        </>
    );
}


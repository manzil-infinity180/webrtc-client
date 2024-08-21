import { useState } from "react";
import { Video } from "./Video";

let peerConnection = new RTCPeerConnection({
    iceServers:  [{
        urls: "stun:stun.l.google.com:19302",
    },],
});

export function ScreenShare() {
    const [screenSharing, setScreenSharing] = useState();
    const [userStream, setUserStream] = useState();
    const [recordStream, setRecordStream] = useState();
    const [share, setShare] = useState({
        screen: true,
        camera: true
    });
    async function CaptureScreen() {
        const displayMediaOptions = {
            video: {
              cursor: "always"
            },
            audio : false
          };
         navigator.mediaDevices.getDisplayMedia(displayMediaOptions).then((stream) => {
            setScreenSharing(stream);
        });
            setShare(s => ({
                ...s,
                screen: false
            }));
        
    }
    async function UserCameraStream() {
        const displayMediaOptions = {
            video: true,
            audio : false
          };
         navigator.mediaDevices.getUserMedia(displayMediaOptions).then((stream) => {
            setUserStream(stream);
        });
        setShare(s => ({
            ...s,
            camera: false
        }));
    }
    async function RecordWindow() {
        const recordedChunks = [];
        const options = { mimeType: "video/webm; codecs=vp9" };
        // const canvas = document.getElementById("canvas"); // should be video tag

// Optional frames per second argument.
        //    const stream = canvas.captureStream(25);
        //    console.log(window.stream);
          const mediaRecorder = new MediaRecorder(screenSharing, options);
          mediaRecorder.ondataavailable = handleDataAvailable;
          mediaRecorder.start();
          setRecordStream(mediaRecorder);
          function handleDataAvailable(e){
            console.log("data-available");
            if (e.data.size > 0) {
                recordedChunks.push(e.data);
                console.log(recordedChunks);
                download();
            }   
        }
        function download() {
            const blob = new Blob(recordedChunks, {
              type: "video/webm",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            a.href = url;
            a.download = "test.webm";
            a.click();
            window.URL.revokeObjectURL(url);
          }
    }
    function StopRecord() {
        recordStream.stop();
    }
    
    return (
        <div id="canvas">
            {share.screen && <button onClick={CaptureScreen}>Share Screen</button>}
            {share.camera && <button onClick={UserCameraStream}>Turn On Camera</button>}
            <Video stream={userStream} width={'10%'} height={'10%'}/>
            <Video stream={screenSharing} width={'90%'} height={'60%'}/>
           {!recordStream && <button onClick={RecordWindow}>RECORD</button>}
            {recordStream &&  <button onClick={StopRecord}>Stop</button>}
        </div>
    );
}
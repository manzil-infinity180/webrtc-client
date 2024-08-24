import { useEffect, useState } from 'react';
import {useParams} from 'react-router-dom';
import {io} from 'socket.io-client';
import { Video } from './Video';

// connecting to the rtcPeerConnection 
let peerConnection = new RTCPeerConnection({
    iceServers:  [{
        urls: "stun:stun.l.google.com:19302",
    },],
});
export function Meeting() {
    const {meetingId} = useParams();
    const [joined, setJoined] = useState(false);
    const [socketDetail, setSocketDetails] = useState(false);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [mutedValue, setMutedValue] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [localChannel, setLocalChannel] = useState(null);
    const [remoteChannel, setRemoteChannel] = useState(null);
    const [messageSend, setMessageSend] = useState("");
    const [disabled, setDisabled] = useState(true);


    async function handelSendChannelStatusChange(e) {
        console.log({localChannel});
        if(localChannel){
            const state = localChannel.readyState;
            console.log({'state': localChannel.readyState} );
            if(state === 'open'){
                setDisabled(false);
            }else{
                setDisabled(true);
            }
        }

    }
    function receiveChannelCallback(e) {
        const channel = e.channel;
        setRemoteChannel(channel);
        channel.onmessage = handleReceiveMessage;
        channel.onopen = () => { console.log('Remote data channel is open'); };
        channel.onclose = () => { console.log('Remote data channel is closed'); };

    }
    function sendMessage(){
        if (localChannel && localChannel.readyState === 'open') {
            localChannel.send(messageSend);
            let divContent = document.getElementById('helloMessage');
            divContent.insertAdjacentHTML('beforeend', `<p>Sent Message : ${messageSend}</p>`);
            setMessageSend("");
        } else {
            console.warn('Data channel is not open');
        }
    }
    function handleReceiveMessage(e) {
        // pEle.innerHTML = "Receive Message : "+e.data;
        console.log('Event Data ' + e.data);
        let divContent = document.getElementById('helloMessage');
        divContent.insertAdjacentHTML('beforeend', `<p>Receive Message : ${e.data}</p>`);
    }
    function handleDisconnect(){
        if (localChannel) {
            localChannel.close();
        }
        if (peerConnection) {
            peerConnection.close();
        }
        if (socketDetail) {
            socketDetail.disconnect();
        }
    }
    useEffect(() => {
        return () => {
            if (localChannel) {
                localChannel.close();
            }
            if (peerConnection) {
                peerConnection.close();
            }
            if (socketDetail) {
                socketDetail.disconnect();
            }
        };
    }, []);

    async function handleScreenShare() {
        if (!isScreenSharing) {
            try {
                const screenStream = await window.navigator.mediaDevices.getDisplayMedia({ video: true });
                const screenTrack = screenStream.getVideoTracks()[0];
               
                // Replace the video track in the peer connection
                const senders = peerConnection.getSenders();
                console.log({
                    peerConnection,
                    senders
                });
                const videoSender = senders.find(sender => sender.track.kind === 'video');
                console.log({videoSender});
                videoSender.replaceTrack(screenTrack);
    
                // Update local stream to reflect the screen sharing
                setLocalStream(screenStream);
                setIsScreenSharing(true);
    
                // Handle the event when the screen sharing stops
                screenTrack.onended = () => {
                    handleStopScreenShare();
                };
            } catch (err) {
                console.error("Error sharing screen: ", err);
            }
        } else {
            // Stop screen sharing and revert to the camera
            handleStopScreenShare();
        }
    }
    
    async function handleStopScreenShare() {
        try {
            const cameraStream = await window.navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const cameraTrack = cameraStream.getVideoTracks()[0];
    
            // Replace the video track in the peer connection
            const senders = peerConnection.getSenders();
            const videoSender = senders.find(sender => sender.track.kind === 'video');
            videoSender.replaceTrack(cameraTrack);
    
            // Update local stream to reflect the camera feed
            setLocalStream(cameraStream);
            setIsScreenSharing(false);
        } catch (err) {
            console.error("Error stopping screen share: ", err);
        }
    }
    
    
    async function handleJoinMeeting() {
        // sending the iceCandidate (for peer Connection)
        peerConnection.onicecandidate = ({candidate}) => {
            console.log({candidate});
            socketDetail.emit('iceCandidate', {
                candidate
            });
        }
        console.log({peerConnection});
        peerConnection.addTrack(localStream.getVideoTracks()[0]);
        console.log({'getVideoTrack': localStream.getVideoTracks()});

        try{
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            console.log({
                'localDescription' : peerConnection.localDescription
            });
            socketDetail.emit('localDescription', {
                description : peerConnection.localDescription
            });
        }catch(err){
            console.log({ msg:err?.message });
            console.error(err);
        }
        setJoined(true);
    }
    useEffect(() => {
        // giving  access to video
        window.navigator.mediaDevices.getUserMedia({video: true, audio:true}).then((stream) => {
            setLocalStream(stream);
        });
          // chatting - data channel
          const channel = peerConnection.createDataChannel('sendMessage');
          setLocalChannel(channel);
          channel.onopen = () => {
            console.log('Data channel is open');
            setDisabled(false);
          };
          channel.onclose = () => {
            console.log('Data channel is open');
            setDisabled(true);
          };

          channel.onmessage = handleReceiveMessage;
          peerConnection.ondatachannel = receiveChannelCallback;
          
        //   peerConnection.ondatachannel = receiveChannelCallback;
        //   setRemoteChannel(peerConnection); // remote channel  // ? try it creating new RTCPeerConnection

        // connecting to server - socket;
        // connecting to socket and sending the meetingID == socket , signalingServer
        // const URL = 'https://webrtc-server-uviu.onrender.com'
        const URL = 'http://localhost:5006'
        const socketIo = io(URL,{
            transports: ['websocket', 'polling', 'flashsocket'],
        });
        socketIo.on('connect', () => {
            setSocketDetails(socketIo);
            socketIo.on('hello',(data) => {
                console.log(data);
            });
            socketIo.emit("join", {
                meetingId
            });
        });

        socketIo.on('localDescription', async ({description}) => {
            console.log({ description });
            peerConnection.setRemoteDescription(description);
            peerConnection.ontrack  = (e) => {
                console.log({'ontrackEvent'  : e.track});
                setRemoteStream(new MediaStream([e.track]));
            }

            socketIo.on('iceCandidate', ({candidate}) => {
                peerConnection.addIceCandidate(candidate);
            });

            peerConnection.onicecandidate = ({candidate}) => {
                socketIo.emit('iceCandidateReply', {
                    candidate
                });
            }
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            socketIo.emit('remoteDescription', {description: peerConnection.localDescription});
        });

        socketIo.on('remoteDescription', async ({description}) => {
            console.log({ description });
            peerConnection.setRemoteDescription(description);
            peerConnection.ontrack  = (e) => {
                console.log(e.track);
                setRemoteStream(new MediaStream([e.track]));
            }

            socketIo.on('iceCandidateReply', ({candidate}) => {
                console.log({'iceCandidate' : candidate});
                peerConnection.addIceCandidate(candidate);
            });

            peerConnection.onicecandidate = ({candidate}) => {
                socketIo.emit('iceCandidateReply', {
                    candidate
                });
            }
        });

    },[]);

    function handleClose(){
        console.log({
            peerConnection,
            localStream,
            remoteStream
        });
        // peerConnection.removeTrack(sender);
        // peerConnection.close();
    }

    if (!localStream) {
        return <div>
            Loading...
        </div>
    }

    if(!joined){
        return (
            <div>
                <h3>Joining Meeting {meetingId}</h3>
                <button onClick={handleJoinMeeting}>{meetingId}</button>
            </div>
        );
    }
   console.log({remoteStream, localStream});
    return (
        <>
           <button onClick={handleClose}>Close</button>
           <button onClick={handleScreenShare}>
            {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
             </button>
           <Video stream={localStream} muted={mutedValue}/>
           <Video stream={remoteStream} />
           <div  style={{
            position:'absolute',
            top:'2%',
            right:'5%',
            padding:'5px 7px',
           }}>
           <button onClick={() => setMutedValue(s => !s)}
           style={{
            position:'absolute',
            top:'2%',
            right:'5%',
            padding:'5px 7px',

           }}
            >{mutedValue ? 'Unmute' : 'Mute'}</button>
            
           </div>
           <div>
           <div id='helloMessage' style={{
                margin:'25px'
            }}>
                <p>Hello World</p>
            </div>
           <input type='text' name="message" disabled={disabled} value={messageSend} onChange={(e)  => setMessageSend(e.target.value)}/>
           <button onClick={handelSendChannelStatusChange}>Connect</button>
           <button onClick={sendMessage} disabled={disabled}>Send Message</button>
           <button onClick={handleDisconnect} disabled={!disabled}>Disconnect Me</button>
           </div>
           
        </>
        
    );
    
}

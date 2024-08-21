import { useEffect, useState } from 'react';
import {useParams, useSearchParams} from 'react-router-dom';
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

    async function handleJoinMeeting() {
        // sending the iceCandidate (for peer Connection)
        peerConnection.onicecandidate = ({candidate}) => {
            socketDetail.emit('iceCandidate', {
                candidate
            });
        }
        peerConnection.addTrack(localStream.getVideoTracks()[0]);

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

            socketIo.on('iceCandidate', ({candidate}) => {
                peerConnection.addIceCandidate(candidate);
            });

            peerConnection.onicecandidate = ({candidate}) => {
                socketIo.emit('iceCandidateReply', {
                    candidate
                });
            }
        });

    },[]);

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
        <div>
           <Video stream={localStream} muted={mutedValue}/>
           <Video stream={remoteStream} />
           <div>
           <button onClick={() => setMutedValue(s => !s)}
           style={{
            position:'absolute',
            top:'2%',
            right:'5%',
            padding:'5px 7px',

           }}
            >{mutedValue ? 'Unmute' : 'Mute'}</button>
           </div>
           
        </div>
    );
    
}

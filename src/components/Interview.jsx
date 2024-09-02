import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Video } from './Video';
import { Editor } from '@monaco-editor/react';
import MonacoCodeEditor from './MonacoCodeEditor';
let peerConnection = new RTCPeerConnection({
    iceServers: [{
        urls: "stun:stun.l.google.com:19302",
    },],
});
function Interview() {
    const { meetingId } = useParams();
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [socketDetail, setSocketDetails] = useState(false);
    const [option, setOption] = useState({
        joined: false,
        isRecording: false,
        isFileReady: false,
        isScreenSharing: false,
        mutedValue: true,
        disabled: true
    });

    useEffect(() => {
        // giving  access to video
        window.navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            setLocalStream(stream);
        });
        // connecting to server - socket;
        // connecting to socket and sending the meetingID == socket , signalingServer
        // const URL = 'https://webrtc-server-uviu.onrender.com'
        const URL = 'http://localhost:5006'
        const socketIo = io(URL, {
            transports: ['websocket', 'polling', 'flashsocket'],
        });
        socketIo.on('connect', () => {
            setSocketDetails(socketIo);
            socketIo.on('hello', (data) => {
                console.log(data);
            });
            socketIo.emit("join", {
                meetingId
            });
        });

        socketIo.on('localDescription', async ({ description }) => {
            console.log({ description });
            peerConnection.setRemoteDescription(description);
            peerConnection.ontrack = (e) => {
                console.log({ 'ontrackEvent': e.track });
                setRemoteStream(new MediaStream([e.track]));
            }

            socketIo.on('iceCandidate', ({ candidate }) => {
                peerConnection.addIceCandidate(candidate);
            });

            peerConnection.onicecandidate = ({ candidate }) => {
                socketIo.emit('iceCandidateReply', {
                    candidate
                });
            }
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            socketIo.emit('remoteDescription', { description: peerConnection.localDescription });
        });

        socketIo.on('remoteDescription', async ({ description }) => {
            console.log({ description });
            peerConnection.setRemoteDescription(description);
            peerConnection.ontrack = (e) => {
                console.log(e.track);
                setRemoteStream(new MediaStream([e.track]));
            }

            socketIo.on('iceCandidateReply', ({ candidate }) => {
                console.log({ 'iceCandidate': candidate });
                peerConnection.addIceCandidate(candidate);
            });

            peerConnection.onicecandidate = ({ candidate }) => {
                socketIo.emit('iceCandidateReply', {
                    candidate
                });
            }
        });

    }, []);

    useEffect(() => {
        return () => {
            if (peerConnection) {
                peerConnection.close();
            }
            if (socketDetail) {
                socketDetail.disconnect();
            }
        };
    }, []);

    async function handleJoinMeeting() {
        // sending the iceCandidate (for peer Connection)
        peerConnection.onicecandidate = ({ candidate }) => {
            console.log({ candidate });
            socketDetail.emit('iceCandidate', {
                candidate
            });
        }
        console.log({ peerConnection });
        peerConnection.addTrack(localStream.getVideoTracks()[0]);
        console.log({ 'getVideoTrack': localStream.getVideoTracks() });

        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            console.log({
                'localDescription': peerConnection.localDescription
            });
            socketDetail.emit('localDescription', {
                description: peerConnection.localDescription
            });
        } catch (err) {
            console.log({ msg: err?.message });
            console.error(err);
        }
        // setJoined(true);
        setOption((s) => ({ ...s, joined: true }));
    }


    if (!option.joined) {
        return (
            <div className='flex justify-center items-center flex-col h-screen'>
                <img src='https://webrtcclient.com/wp-content/uploads/2021/09/WebRTC-740-fi.png' alt="webrtc"
                loading='lazy'
                    className='w-48 sm:w-72' />
                <h3 className='text-xl italic'>Join the Meeting</h3>
                <button onClick={handleJoinMeeting} className='text-lg border font-mono rounded bg-blue-600 text-white px-3 py-2'>Join Now!</button>
            </div>
        );
    }

    return (
        <>
            <div className="p-4 space-y-6 bg-gray-100">
                <div className='flex justify-center'>
                <span className="text-2xl sm:text-3xl font-serif mb-1 mt-0 bg-pink-200 text-center rounded px-4">
                    Interview Section - Peer to Peer
                </span>
                </div>
                <div className="bg-white p-6 shadow-lg rounded-md">
                    <div className="flex justify-center space-x-4 mb-4">
                        <Video stream={localStream} muted={option.mutedValue} />
                        <Video stream={remoteStream} />
                    </div>
                    <div className='flex justify-center'>
                    <button onClick={() => setOption((s) => ({ ...s, mutedValue: !option.mutedValue }))}
                        className={`btn btn-secondary font-medium m-1 text-lg border font-serif rounded border-white text-center px-2 py-1 ${option.mutedValue ? 'bg-green-500' : 'bg-red-600 text-white'}`}>
                        {option.mutedValue ? 'Unmute' : 'Mute'}
                    </button>
                    </div>
                    
                    
                </div>
            </div>
            <MonacoCodeEditor />
        </>
    );
}

export default Interview;
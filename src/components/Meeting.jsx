import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Video } from './Video';
import YoutubeVideos from './YoutubeVideos';
import { Loader } from '../utils/Loader';
import toast from 'react-hot-toast';

// connecting to the rtcPeerConnection 
let peerConnection = new RTCPeerConnection({
    iceServers: [{
        urls: "stun:stun.l.google.com:19302",
    },],
});
console.log({ peerConnection });
export function Meeting() {
    const { meetingId } = useParams();
    const navigate = useNavigate();
    const [option, setOption] = useState({
        joined: false,
        isRecording: false,
        isFileReady: false,
        isScreenSharing: false,
        mutedValue: true,
        disabled: true
    });
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [socketDetail, setSocketDetails] = useState(false);
    const [localChannel, setLocalChannel] = useState(null);
    const [remoteChannel, setRemoteChannel] = useState(null);
    const [fileTransferChannel, setFileTransferChannel] = useState(null);
    const [messageSend, setMessageSend] = useState("");
    const [receivedFile, setReceivedFile] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [recordStream, setRecordStream] = useState();
    const [recordOption, setRecordOption] = useState('localStream');
    const [fileRecOptions, setFileRecOptions] = useState({
        name: "FIleReceived",
        type: "video/webm"
    });
    const [roomId, setRoomId] = useState("");
    const chatBoxRef = useRef(null);
    const [sendingRate, setSendingRate] = useState("");
    useEffect(() => {
        // Scroll to the bottom when a new message is added
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    });


    async function handelSendChannelStatusChange(e) {
        console.log({ localChannel });
        console.log(e);
        if (localChannel) {
            const state = localChannel.readyState;
            console.log({ 'state': localChannel.readyState });
            if (state === 'open') {
                setOption((s) => ({ ...s, disabled: false }));
            } else {
                setOption((s) => ({ ...s, disabled: true }));
            }   
        }
        if(localChannel.readyState === 'open'){
            toast.success("Everything is Fine, Lets Chat");
        }else{
            toast.success(localChannel.readyState.toUpperCase());
        }
        
    }
    function receiveChannelCallback(e) {
        const channel = e.channel;
        setRemoteChannel(channel);
        channel.onmessage = handleReceiveMessage;
        channel.onopen = () => { console.log('Remote data channel is open'); };
        channel.onclose = () => { console.log('Remote data channel is closed'); };

    }
    function sendMessage() {
        if (localChannel && localChannel.readyState === 'open' && messageSend.length > 0) {
            localChannel.send(messageSend);
            let divContent = document.getElementById('chat-box');
            divContent.insertAdjacentHTML('beforeend', `
                <tr class="text-right m-3">
                <td class="max-w-md">
                <span
                 translate="no" class="inline-block py-2 m-2 px-4 pr-2 font-mono font-medium text-md leading-6 text-slate-50 whitespace-normal break-words dark:text-white bg-green-600 rounded-lg">
                 ${escapeHTML(messageSend)}</span> </td>
                </tr>`);
            divContent.scrollTop = divContent.scrollHeight; // Scroll to bottom
            setMessageSend("");
        } else {
            console.warn('Data channel is not open');
        }
    }
    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    function handleReceiveMessage(e) {
        console.log('Event Data ' + e.data);
        let divContent = document.getElementById('chat-box');

        divContent.insertAdjacentHTML('beforeend', `
                <tr class="text-left m-3">
                <td class="max-w-md">
                    <span
                    translate="no" class="inline-block py-2 m-2 px-4 pr-2 font-mono font-medium text-md leading-6 text-slate-50 whitespace-normal break-words dark:text-white bg-purple-600 rounded-lg">
                    ${escapeHTML(e.data)}</span>
                </td>
                </tr>`);
        divContent.scrollTop = divContent.scrollHeight; // Scroll to bottom
        toast.success("Message Received");
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
        if (!option.isScreenSharing) {
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
                console.log({ videoSender });
                videoSender.replaceTrack(screenTrack);
                toast.success("Started Sharing Screen");
                // Update local stream to reflect the screen sharing
                setLocalStream(screenStream);
                setOption((s) => ({ ...s, isScreenSharing: true }));
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
            setOption((s) => ({ ...s, isScreenSharing: false }));
        } catch (err) {
            console.error("Error stopping screen share: ", err);
        }
    }


    async function handleJoinMeeting() {
        if (roomId.length < 1) {
            toast.error("Enter Your Room Id");
            return;
        }
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
        toast.success("Lets Fun bro");
        try {
            const offer = await peerConnection.createOffer();
            console.log({ offer });
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

        // window.history.pushState(null, null, window.location.href);
        // window.onpopstate = function () {
        //     window.history.go(1);
        // };
        navigate(`/meeting/${roomId}`)
    }
    useEffect(() => {
        const onConfirmRefresh = function (event) {
            event.preventDefault();
            return event.returnValue = "Are you sure you want to leave the page?";
          }  
          window.addEventListener("beforeunload", onConfirmRefresh, { capture: true });
    },[]);
    function sendFiles(file) {
        // decide the chunks to transfer in one go
        socketDetail.emit('fileOptions', {
            'filetype': file.type,
            'filename': file.name
        });

        const chunksize = 256 * 1024;
        const fileReader = new FileReader();
        let offset = 0;
        fileReader.onload = (e) => {
            const buffer = e.target.result;
            fileTransferChannel.send(buffer); // Send the chunk via the data channel

            offset += buffer.byteLength;
            console.log("file transfer " + offset / 1024);
            setSendingRate(`${(offset / 1024) / 1024} Mb` );
            if (offset < file.size) {
                // readSlice(offset); // read next chunks 
                setTimeout(() => {
                    readSlice(offset);
                },100);
            } else {
                fileTransferChannel.send('EOF');  // end of file 
                setSelectedFile(null);
            }
        }
        const readSlice = (offset) => {
            const slice = file.slice(offset, offset + chunksize);
            fileReader.readAsArrayBuffer(slice);
        }
        readSlice(0);
    }
    useEffect(() => {
        // giving  access to video
        window.navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            setLocalStream(stream);
        });
        // chatting - data channel
        const channel = peerConnection.createDataChannel('sendMessage');
        if (channel.readyState === 'open') {
            toast.success("Messenger section is now activated");
        }
        setLocalChannel(channel);
        channel.onopen = () => {
            console.log('Data channel is open');
            setOption((s) => ({ ...s, disabled: false }));
        };
        channel.onclose = () => {
            console.log('Data channel is close');
            setOption((s) => ({ ...s, disabled: true }));
        };

        channel.onmessage = handleReceiveMessage;
        //   peerConnection.ondatachannel = receiveChannelCallback;

        const fileChannel = peerConnection.createDataChannel('sendFiles');
        fileChannel.binaryType = 'arraybuffer';
        setFileTransferChannel(fileChannel);

        // connecting to server - socket;
        // connecting to socket and sending the meetingID == socket , signalingServer
        // const URL = 'http://localhost:5006'
        const URL = import.meta.env.VITE_SEVER_API;
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
                console.log({ candidate });
                peerConnection.addIceCandidate(candidate);
            });

            peerConnection.onicecandidate = ({ candidate }) => {
                socketIo.emit('iceCandidateReply', {
                    candidate
                });
            }
            const answer = await peerConnection.createAnswer();
            console.log({ answer });
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

        socketIo.on('fileOptions', (data) => {
            const { filename, filetype } = data;
            console.log(data);
            setFileRecOptions({
                name: filename,
                type: filetype
            });
        });
        // handle the file transfer 
        let receiveBuffer = [];
        fileChannel.onmessage = (e) => {
            if (e.data === 'EOF') {
                const receiveFile = new Blob(receiveBuffer, { type: fileRecOptions.type });
                console.log(fileRecOptions);
                setReceivedFile(receiveFile);
                setOption((s) => ({ ...s, isFileReady: true }));  // Enable the download button
                receiveBuffer = [];
            } else {
                receiveBuffer.push(e.data);
            }
        }

        // Handle incoming data channels (remote peer)
        peerConnection.ondatachannel = (e) => {
            const file_channel = e.channel;
            console.log(file_channel);
            if (file_channel.label === 'sendFiles') {

                file_channel.onmessage = (e) => {
                    if (e.data === 'EOF') {
                        const receiveFile = new Blob(receiveBuffer, { type: fileRecOptions.type, });
                        console.log({ receiveFile });
                        console.log(fileRecOptions);
                        setReceivedFile(receiveFile);
                        setOption((s) => ({ ...s, isFileReady: true }));
                        receiveBuffer = [];
                    } else {
                        receiveBuffer.push(e.data);
                    }
                }
            } else if (file_channel.label === 'sendMessage') {
                receiveChannelCallback(e);
            }
        }

    }, []);

    function handleClose() {

        if (localChannel) {
            localChannel.close();
        }
        if (peerConnection) {
            peerConnection.close();
        }
        if (socketDetail) {
            socketDetail.disconnect();
        }
        if (localStream) {
            localStream.getTracks().forEach(function (track) {
                track.stop();
            });
        }
        setTimeout(() => {
            navigate('/');
            location.reload();
        }, 400);
    }

    function handleFileInput(event) {
        const file = event.target.files[0];
        console.log({ 'file_input': file });
        if (file) {
            setSelectedFile(file);
        }
    }
    function handleDownload() {
        if (receivedFile) {
            console.log(receivedFile);
            const url = window.URL.createObjectURL(receivedFile);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = fileRecOptions.name;
            anchor.click();
            window.URL.revokeObjectURL(url);
            setOption((s) => ({ ...s, isFileReady: false }));
            setReceivedFile(null);
            toast.success("Downloading....");
        }
    }
    // record one screen 
    async function RecordWindow() {
        const recordedChunks = [];
        const options = { mimeType: "video/webm; codecs=vp9" };
        // const canvas = document.getElementById("canvas"); // should be video tag
        let mediaRecorder;
        if (recordOption === 'localStream') {
            mediaRecorder = new MediaRecorder(localStream, options);
        } else {
            mediaRecorder = new MediaRecorder(remoteStream, options);
        }
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.start();
        setRecordStream(mediaRecorder);
        setOption((s) => ({ ...s, isRecording: true }));
        toast.success("Started Recording...");
        function handleDataAvailable(e) {
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
        setOption((s) => ({ ...s, isRecording: false }));
    }
    function handleRecordOption(e) {
        if (e.target.value !== 'localStream') {
            setRecordOption('remoteStream');
        }
        console.log(e.target.value);
    }
    if (!localStream) {
        return <Loader />
    }

    if (!option.joined) {
        // function handleInvitationLink(){
        //     const msg = `
        //     Your Friend is inviting you to a fun meeting.

        //     Topic: Lets do some Chit-Chat

        //     Join Zoom Meeting
        //      ${window.location.href.split('/meeting/')}

        //     Meeting ID: ${roomId}
        //      `
        //     navigator.clipboard.writeText(msg);
        //     toast.success(`Copied Invite Link`);
        // }
        return (
            <div className='flex justify-center items-center flex-col h-screen'>
                <img src='https://webrtcclient.com/wp-content/uploads/2021/09/WebRTC-740-fi.png' alt="webrtc"
                    loading='lazy'
                    className='w-48 sm:w-72' />
                <h3 className='text-xl italic'>Join the Meeting</h3>
                <input placeholder='Enter Room Id' className="file-input text-lg font-serif m-4 px-2" value={roomId} onChange={(e) => setRoomId(e.target.value)} />
                <button onClick={handleJoinMeeting} className='text-lg border font-mono rounded bg-blue-600 text-white px-3 py-2'>Join Now!</button>
                {/* {roomId && <div className='flex justify-center cursor-pointer' onClick={handleInvitationLink}  >
                    <span className="text-xs sm:text-lg font-serif mt-3 bg-pink-200 text-center rounded px-4 opacity-65">
                        Copy Invitation Link
                    </span>
                </div>} */}
            </div>
        );
    }
    console.log({ remoteStream, localStream });
    return (
        <>
            <div className="p-4 space-y-6 bg-gray-100">
                <div className='flex justify-center'>
                    <span className="text-2xl sm:text-3xl font-serif mb-1 mt-0 bg-pink-200 text-center rounded px-4">
                        Reach Peer to Peer Communication
                    </span>
                </div>
                <div className="bg-white p-6 shadow-lg rounded-md">
                    <div className="flex-col justify-center space-x-4 mb-4 md:flex md:flex-row">
                        <Video stream={localStream} muted={option.mutedValue} />
                        <Video stream={remoteStream} />
                    </div>
                    <div className="flex space-x-4 justify-center">
                        <button onClick={handleClose} className="btn btn-secondary font-medium m-1 text-lg border border-white font-serif rounded  bg-red-600 text-white px-3 py-2">Close</button>
                        <button onClick={handleScreenShare}
                            className={`btn btn-secondary font-medium m-1 text-lg border font-serif rounded text-white border-white ${option.isScreenSharing ? 'bg-red-600' : 'bg-indigo-500'}`}>
                            {option.isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                        </button>
                        <button onClick={() => setOption((s) => ({ ...s, mutedValue: !option.mutedValue }))}
                            className={`btn btn-secondary font-medium m-1 text-lg border font-serif rounded border-white ${option.mutedValue ? 'bg-green-500' : 'bg-red-600 text-white'}`}>
                            {option.mutedValue ? 'Unmute' : 'Mute'}
                        </button>
                    </div>
                </div>

                <div className="relative bg-white p-4 shadow-lg rounded-md flex justify-center">
                    <YoutubeVideos peerConnection={peerConnection} />
                </div>

                <div className="bg-white p-6 shadow-lg rounded-md">
                    <div className="p-5 max-w-lg mx-auto bg-gray-100 rounded-lg shadow-lg">
                        <div id='helloMessage' className="mb-6">
                            <h1 className="text-3xl font-mono text-start text-gray-800">Messenger</h1>
                            <button onClick={handelSendChannelStatusChange}
                                className="font-medium px-4 py-2 text-lg text-white border border-transparent rounded bg-green-500 hover:bg-green-600 transition-all my-3"
                            >
                                Is Connected
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <input
                                type='text'
                                name="message"
                                disabled={option.disabled}
                                value={messageSend}
                                onChange={(e) => setMessageSend(e.target.value)}
                                className="bg-gray-200 outline-none border border-gray-300 font-mono rounded px-4 py-2 w-4/5 md:flex-1 transition-all focus:ring-2 focus:ring-blue-400"
                                autoComplete='off'
                                placeholder="Type your message..."
                            />

                            <button
                                onClick={sendMessage}
                                disabled={option.disabled}
                                className="font-medium px-4 py-2 text-lg text-white border border-transparent rounded bg-blue-500 hover:bg-blue-600 transition-all w-4/5 md:w-auto md:ml-4"
                            >
                                Send Message
                            </button>
                        </div>
                    </div>

                    <div className="p-5 max-w-lg mx-auto bg-gray-100 rounded-lg shadow-lg space-y-6">
                        {/* File Transfer Section */}
                        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mt-4">
                            <div className="text-lg font-serif w-full md:w-1/2">
                                <span className="bg-pink-200 p-2 block mb-4 rounded">Send Any Type of File P2P</span>
                                <input
                                    type="file"
                                    onChange={handleFileInput}
                                    className="file-input w-full text-lg font-serif my-4 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
                                />
                                <button
                                    onClick={() => sendFiles(selectedFile)}
                                    disabled={!selectedFile}
                                    className={`font-medium text-lg px-4 py-2 rounded ${selectedFile ? 'bg-green-400 text-white' : 'bg-gray-300'} transition-all`}
                                >
                                    Send File
                                </button>
                                {sendingRate && <p>Sending Rate : {sendingRate}</p>}
                                {option.isFileReady && (
                                <button
                                    onClick={handleDownload}
                                    className="font-medium my-3 text-lg px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-all"
                                >
                                    Download Received File
                                </button>
                            )}
                            </div>

                            
                        </div>

                        {/* Recording Section */}
                        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mt-4">
                            {!option.isRecording ? (
                                <button
                                    onClick={RecordWindow}
                                    className="font-medium px-4 py-2 text-lg text-white rounded bg-green-600 hover:bg-green-700 transition-all"
                                >
                                    Start Recording
                                </button>
                            ) : (
                                <button
                                    onClick={StopRecord}
                                    className="font-medium px-4 py-2 text-lg text-white rounded bg-red-600 hover:bg-red-700 transition-all"
                                >
                                    Stop
                                </button>
                            )}

                            <select
                                onChange={handleRecordOption}
                                className="font-mono text-md rounded bg-blue-200 p-2"
                            >
                                <option value="localStream" defaultValue>Record Myself</option>
                                <option value="remoteStream">Record Other</option>
                            </select>
                        </div>
                    </div>


                </div>
                <div className="p-5 max-w-lg mx-auto bg-gray-100 rounded-lg shadow-lg space-y-6">
                    <div ref={chatBoxRef} className="chat-container h-64 overflow-y-auto p-4 border border-gray-300 rounded-md">
                        <table className='w-full text-left border-collapse'>
                            <tbody className='align-baseline' id='chat-box'>
                                <tr>
                                    <td translate="no" className="py-2 my-3 pr-2 font-serif text-xl leading-6 whitespace-nowrap ">All Messages</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

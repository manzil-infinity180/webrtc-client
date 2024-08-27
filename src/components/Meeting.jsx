import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Video } from './Video';
import YoutubeVideos from './YoutubeVideos';

// connecting to the rtcPeerConnection 
let peerConnection = new RTCPeerConnection({
    iceServers: [{
        urls: "stun:stun.l.google.com:19302",
    },],
});
export function Meeting() {
    const { meetingId } = useParams();
    const [joined, setJoined] = useState(false);
    const [socketDetail, setSocketDetails] = useState(false);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [mutedValue, setMutedValue] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [localChannel, setLocalChannel] = useState(null);
    const [remoteChannel, setRemoteChannel] = useState(null);
    const [fileTransferChannel, setFileTransferChannel] = useState(null);
    const [messageSend, setMessageSend] = useState("");
    const [disabled, setDisabled] = useState(true);
    const [isFileReady, setIsFileReady] = useState(false);
    const [receivedFile, setReceivedFile] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [recordStream, setRecordStream] = useState();
    const [isRecording, setIsRecording] = useState(false);
    const [recordOption, setRecordOption] = useState('localStream');
    const [fileRecOptions, setFileRecOptions] = useState({
        name: "FIleReceived",
        type: "video/webm"
    });


    async function handelSendChannelStatusChange(e) {
        console.log({ localChannel });
        if (localChannel) {
            const state = localChannel.readyState;
            console.log({ 'state': localChannel.readyState });
            if (state === 'open') {
                setDisabled(false);
            } else {
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
    function sendMessage() {
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
    function handleDisconnect() {
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
                console.log({ videoSender });
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
        setJoined(true);
    }
    function sendFiles(file) {
        // decide the chunks to transfer in one go
        socketDetail.emit('fileOptions', {
            'filetype': file.type,
            'filename': file.name
        });

        const chunksize = 66560;
        const fileReader = new FileReader();
        let offset = 0;
        fileReader.onload = (e) => {
            const buffer = e.target.result;
            fileTransferChannel.send(buffer); // Send the chunk via the data channel

            offset += buffer.byteLength;
            console.log("file transfer " + offset / 1024);
            if (offset < file.size) {
                readSlice(offset); // read next chunks 
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
        setLocalChannel(channel);
        channel.onopen = () => {
            console.log('Data channel is open');
            setDisabled(false);
        };
        channel.onclose = () => {
            console.log('Data channel is close');
            setDisabled(true);
        };

        channel.onmessage = handleReceiveMessage;
        //   peerConnection.ondatachannel = receiveChannelCallback;

        const fileChannel = peerConnection.createDataChannel('sendFiles');
        fileChannel.binaryType = 'arraybuffer';
        setFileTransferChannel(fileChannel);

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
                setIsFileReady(true); // Enable the download button
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
                        setIsFileReady(true);
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
        console.log({
            peerConnection,
            localStream,
            remoteStream
        });
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
            setIsFileReady(false);
            setReceivedFile(null);
        }
    }

    // record one screen 
    async function RecordWindow() {
        const recordedChunks = [];
        const options = { mimeType: "video/webm; codecs=vp9" };
        // const canvas = document.getElementById("canvas"); // should be video tag

        // Optional frames per second argument.
        //    const stream = canvas.captureStream(25);
        //    console.log(window.stream);
        let mediaRecorder;
        if (recordOption === 'localStream') {
            mediaRecorder = new MediaRecorder(localStream, options);
        } else {
            mediaRecorder = new MediaRecorder(remoteStream, options);
        }
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.start();
        setRecordStream(mediaRecorder);
        setIsRecording(true);
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
        setIsRecording(false);
    }
    function handleRecordOption(e) {
        if (e.target.value !== 'localStream') {
            setRecordOption('remoteStream');
        }
        console.log(e.target.value);
    }
    if (!localStream) {
        return <div>
            Loading...
        </div>
    }

    if (!joined) {
        return (
            <div>
                <h3>Joining Meeting {meetingId}</h3>
                <button onClick={handleJoinMeeting}>{meetingId}</button>
            </div>
        );
    }
    console.log({ remoteStream, localStream });
    return (
        <div>

            <div>
                <div>
                <Video stream={localStream} muted={mutedValue} />
                <Video stream={remoteStream} />
                </div>
                <div>
                <button onClick={handleClose}>Close</button>
                <button onClick={handleScreenShare}>
                    {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                </button>
                </div>
            </div>

            <div style={{
                position: 'absolute',
                top: '2%',
                right: '5%',
                padding: '5px 7px',
            }}>
                <button onClick={() => setMutedValue(s => !s)}
                    style={{
                        position: 'absolute',
                        top: '2%',
                        right: '5%',
                        padding: '5px 7px',

                    }}
                >{mutedValue ? 'Unmute' : 'Mute'}</button>

            </div>
            <div>
                <div id='helloMessage' style={{
                    margin: '25px'
                }}>
                    <p>Hello World</p>
                </div>
                <input type='text' name="message" disabled={disabled} value={messageSend} onChange={(e) => setMessageSend(e.target.value)} />
                <button onClick={handelSendChannelStatusChange}>Connect</button>
                <button onClick={sendMessage} disabled={disabled}>Send Message</button>
                <button onClick={handleDisconnect} disabled={!disabled}>Disconnect Me</button>
            </div>
            <div>
                <input type="file" onChange={handleFileInput} />
                <button onClick={() => sendFiles(selectedFile)} disabled={!selectedFile}>
                    Send File
                </button>
            </div>

            {isFileReady && (
                <div>
                    <button onClick={handleDownload}>
                        Download Received File
                    </button>
                </div>
            )}

            {(!isRecording) && <button onClick={RecordWindow}>RECORD</button>}
            {isRecording && <button onClick={StopRecord}>Stop</button>}

            <select onChange={handleRecordOption}>
                <option name="localStream" value={'localStream'} defaultValue={true}>Record Myself</option>
                <option name="remoteStream" value={'remoteStream'}>Record Other</option>
            </select>
            {/* {showVideo && <div style={{
        position:'absolute',
        right:'0px',
        top:'120px'
       }}>
            <YoutubeVideos ytDataChannel={ytDataChannel} peerConnection={peerConnection}/>
        </div>} */}
            <YoutubeVideos peerConnection={peerConnection} />

        </div>

    );
}

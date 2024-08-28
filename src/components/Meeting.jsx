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


    async function handelSendChannelStatusChange(e) {
        console.log({ localChannel });
        if (localChannel) {
            const state = localChannel.readyState;
            console.log({ 'state': localChannel.readyState });
            if (state === 'open') {
                setOption((s) => ({ ...s, disabled: false }));
            } else {
                setOption((s) => ({ ...s, disabled: true }));
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
            let divContent = document.getElementById('yeahBaby');
            divContent.insertAdjacentHTML('beforeend', `
                <tr>
                <td translate="no" className="py-2 pr-2 font-mono font-medium text-xs leading-6 text-sky-500 whitespace-nowrap dark:text-sky-400">
                Sent Message : ${messageSend}</td>
                </tr>`);
            setMessageSend("");
        } else {
            console.warn('Data channel is not open');
        }
    }
    function handleReceiveMessage(e) {
        // pEle.innerHTML = "Receive Message : "+e.data;
        console.log('Event Data ' + e.data);
        // let divContent = document.getElementById('helloMessage');
        // divContent.insertAdjacentHTML('beforeend', `<p>Receive Message : ${e.data}</p>`);
        let divContent = document.getElementById('yeahBaby');
        divContent.insertAdjacentHTML('beforeend', `
                <tr>
                <td translate="no" className="py-2 pr-2 font-mono font-medium text-xs leading-6 text-sky-500 whitespace-nowrap dark:text-sky-400">
                Receive Message : ${e.data}</td>
                </tr>`);
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
            setOption((s) => ({ ...s, isFileReady: false }));
            setReceivedFile(null);
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
        return <div>
            Loading...
        </div>
    }

    if (!option.joined) {
        return (
            <div>
                <h3>Joining Meeting {meetingId}</h3>
                <button onClick={handleJoinMeeting}>{meetingId}</button>
            </div>
        );
    }
    console.log({ remoteStream, localStream });
    return (
        <>
            <div className="p-4 space-y-6 bg-gray-100">
                <div className="bg-white p-6 shadow-lg rounded-md">
                    <div className="flex justify-start space-x-4 mb-4">
                        <Video stream={localStream} muted={option.mutedValue} />
                        <Video stream={remoteStream} />
                    </div>
                    <div className="flex space-x-4">
                        <button onClick={handleClose} className="btn btn-secondary text-lg font-medium m-1">Close</button>
                        <button onClick={handleScreenShare} className="btn btn-secondary text-lg font-medium m-1">
                            {option.isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                        </button>
                        <button onClick={() => setOption((s) => ({ ...s, mutedValue: !option.mutedValue }))} className="btn btn-secondary text-lg font-medium m-1">
                            {option.mutedValue ? 'Unmute' : 'Mute'}
                        </button>
                    </div>
                </div>

                <div className="relative bg-white p-4 shadow-lg rounded-md flex justify-center">
                    <YoutubeVideos peerConnection={peerConnection} />
                </div>

                <div className="bg-white p-6 shadow-lg rounded-md">
                    <div className="mb-4">
                        <div id='helloMessage' className="text-lg font-medium">Start Messaging</div>
                        <input type='text' name="message" disabled={option.disabled} value={messageSend}
                            onChange={(e) => setMessageSend(e.target.value)}
                            className="input-field"
                        />
                        <div className="flex space-x-4 mt-4">
                            <button onClick={handelSendChannelStatusChange} className="btn btn-primary text-lg font-medium m-1">Connect</button>
                            <button onClick={sendMessage} disabled={option.disabled} className="btn btn-primary text-lg font-medium m-1">Send Message</button>
                            <button onClick={handleDisconnect} disabled={!option.disabled} className="btn btn-danger text-lg font-medium m-1">Disconnect Me</button>
                        </div>
                    </div>
                    <div className="mb-4">
                        <div className='flex space-x-4 mt-4'>
                            <div className="text-lg font-medium">Send Any Type File P2P</div>
                            <input type="file" onChange={handleFileInput} className="file-input" />
                            <button onClick={() => sendFiles(selectedFile)} disabled={!selectedFile}
                                className="btn btn-primary text-lg font-medium m-1">
                                Send File
                            </button>
                            {option.isFileReady && (
                                <button onClick={handleDownload} className="btn btn-secondary mt-4 text-lg font-medium m-1">
                                    Download Received File
                                </button>
                            )}
                        </div>
                    </div>
                    <div className='flex space-x-4 mt-4'>
                        <div className="text-lg font-medium">Recording </div>
                        {!option.isRecording ? (
                            <button onClick={RecordWindow} className="btn btn-primary mt-4 text-lg font-medium m-1">RECORD</button>
                        ) : (
                            <button onClick={StopRecord} className="btn btn-danger text-lg font-medium m-1">Stop</button>
                        )}

                        <select onChange={handleRecordOption} className="select-box mt-4">
                            <option name="localStream" value={'localStream'} defaultValue={true}>Record Myself</option>
                            <option name="remoteStream" value={'remoteStream'}>Record Other</option>
                        </select>
                    </div>

                </div>
                <div className="bg-white p-6 shadow-lg rounded-md">
                    <table className='w-full text-left border-collapse'>
                        <tbody className='align-baseline' id='yeahBaby'>
                            <tr>
                                <td translate="no" className="py-2 pr-2 font-mono font-medium text-xs leading-6 text-sky-500 whitespace-nowrap dark:text-sky-400">All Message Here</td>
                            </tr>

                        </tbody>

                    </table>
                </div>
            </div>
        </>
    );
}

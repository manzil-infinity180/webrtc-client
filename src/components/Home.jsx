import { useState } from "react";
import { useNavigate } from "react-router-dom"

export function Home() {
    const [meetingId, setMeetingId] = useState("");
    const navigate = useNavigate();
    function handleMeetingId(e) {
        setMeetingId(e.target.value);
    }
    return (
        <>
            <div>
                <h1>Hello, Welcome to WebRTC Video Conference</h1>
                <input type="text" placeholder="Enter the meeting Id" value={meetingId} onChange={handleMeetingId} />
                {meetingId && <button onClick={() => navigate(`/meeting/${meetingId}`)}>{'MeetingId : ' + meetingId}</button>}
                {meetingId && <button onClick={() => navigate(`/screen/${meetingId}`)}>{'ScreenShare : ' + meetingId}</button>}
                {meetingId && <button onClick={() => navigate(`/chat/${meetingId}`)}>{'Lets Chat : ' + meetingId}</button>}
            </div>
            <div className="bg-gray-100">
                <div className="bg-white shadow-lg rounded-md flex justify-center mx-48 my-8 py-6">
                    <div className="flex justify-start space-x-4 mb-4">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b6/Image_created_with_a_mobile_phone.png"
                            width='360px' height='240px' />
                    </div>
                    <div className="mx-12">
                        <h1 className="m-1">Peer to Peer Communication</h1>
                        <p className="mt-1">P2P Inteaction, call, Yt Video, Messenging and Transfer files</p>
                        <button className="mx-12 my-4 text-lg">Lets Do 1:1</button>
                    </div>
                </div>
            </div>
            <div className="bg-white shadow-lg rounded-md flex justify-center mx-48 my-8 py-6">
                <div className="flex justify-start space-x-4 mb-4">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b6/Image_created_with_a_mobile_phone.png"
                        width='360px' height='240px' />
                </div>
                <div className="mx-12">
                    <h1 className="m-1">Interview P2P</h1>
                    <p className="mt-1">Collobrative Code Editor and Peer to Peer Interaction</p>
                    <button className="mx-12 my-4 text-lg">Lets Do 1:1 And Code Editor</button>
                </div>
            </div>

            <div className="bg-white shadow-lg rounded-md flex justify-center mx-48 my-8 py-6">
                <div className="flex justify-start space-x-4 mb-4">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b6/Image_created_with_a_mobile_phone.png"
                        width='360px' height='240px' />
                </div>
                <div className="mx-12">
                    <h1 className="m-0">One to Many VideoCall</h1>
                    <p className="mt-0 pt-0">Collobrative Code Editor and Peer to Peer Interaction</p>
                    <button className="mx-12 my-4 text-lg">Lets Do 1:4</button>
                </div>
            </div>
        </>
    );
}

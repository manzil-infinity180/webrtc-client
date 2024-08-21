import { useState } from "react";
import {useNavigate} from "react-router-dom"

export function Home() {
    const [meetingId, setMeetingId] = useState("");
    const navigate = useNavigate();
    function handleMeetingId(e) {
      setMeetingId(e.target.value);
    }
    return (
        <div>
            <h1>Hello, Welcome to WebRTC Video Conference</h1>
            <input type="text" placeholder="Enter the meeting Id" value={meetingId} onChange={handleMeetingId}/>
            {meetingId && <button onClick={() => navigate(`/meeting/${meetingId}`)}>{'MeetingId : '+ meetingId}</button>}
            {meetingId && <button onClick={() => navigate(`/screen/${meetingId}`)}>{'ScreenShare : '+ meetingId}</button>}
        </div>
    );
}

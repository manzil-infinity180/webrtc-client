import { useEffect, useState } from "react";

let peerConnection = new RTCPeerConnection({
    iceServers: [{
        urls: "stun:stun.l.google.com:19302",
    },],
});
export function MessageBot() {
    const [connect, setConnect] = useState(true);
    useEffect(() => {
        const dataChannel = peerConnection.createDataChannel('message-bot');
        console.log({dataChannel});
        dataChannel.onopen = (event) => {
            console.log("hello");
            dataChannel.send("Hi you!");
        };
        dataChannel.onmessage = (event) => {
            console.log(event.data);
        };


    }, []);
    return (
        <div>
            <h3>Lets Do Some Chatting</h3>
            <button onClick={() => setConnect(s => !s)}>{connect ? 'Lets Connect' : 'Disconnect'}</button>
            {
                !connect && <>
                    <div className="messagebox">
                        <label htmlFor="message"
                        >Enter a message:
                            <input
                                type="text"
                                name="message"
                                id="message"
                                placeholder="Message text"
                                inputMode="latin"
                                size="60"
                                maxLength="120"
                                 />
                        </label>
                        <button id="sendButton" name="sendButton" className="buttonright">
                            Send
                        </button>
                    </div>

                    <div className="messagebox" id="receivebox">
                        <p>Messages received: </p>
                    </div>
                </>
            }

        </div>
    );
}
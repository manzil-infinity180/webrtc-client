import { useEffect, useRef, useState } from "react";

function YoutubeVideos({peerConnection}) {
    const [videoID, setVideoID] = useState("");
    const [showMe, setShowMe] = useState(false);
    const youtubePlayer = useRef();
    const ytDataChannel = useRef();
    useEffect(() => {
        const ytChannel = peerConnection.createDataChannel('youtube');
          console.log("ytChannel");
          console.log({ytChannel});
          ytDataChannel.current = ytChannel;
          ytChannel.onopen = (e) => {
            console.log("Youtube channel is open now");
            console.log({'ytChannel': e});
          }
          ytChannel.onopen = (e) => {
            console.log("Youtube channel is closed now");
            console.log({'ytChannel': e});
          }
          ytChannel.onmessage = (event) => {
            console.log('Message received:', event.data);
            const {type } = JSON.parse(event.data);
            console.log(type);
            console.log(type==='load');
            if(type === 'load') {
                console.log('Hello here');
                const { data } = JSON.parse(event.data);
                youtubePlayer.current.loadVideoById(data.videoID);
            }
            if (type === 'sync') {
                const {data } = JSON.parse(event.data);
                youtubePlayer.current.seekTo(data.time, true);
                if (data.state === 1) youtubePlayer.current.playVideo();
                else if (data.state === 2) youtubePlayer.current.pauseVideo();
            }
           
        };
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        window.onYouTubeIframeAPIReady = loadVideoPlayer;
    },[]);

    function loadVideoPlayer(){
        console.log("hello");
        const player = new window.YT.Player('player',{
            height: '390',
            width: '640',
            playerVars: {
                'autoplay': 0,
            },
              events: {
                // 'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
            }
        });
        youtubePlayer.current = player;
        console.log(ytDataChannel.current);
    }

    const onPlayerStateChange = (event) => {
        console.log({'onPlayerStateChannel': event});
        console.log(ytDataChannel.current);
        if (ytDataChannel.current && ytDataChannel.current.readyState === 'open') {
            const state = event.data;
            console.log("yeah bro i am here");
            const time = youtubePlayer.current.getCurrentTime();
            console.log({time,state});
            console.log("send the data brooo");
            ytDataChannel.current.send(JSON.stringify({ type: 'sync', data: { state, time } }));
        }
    };

    function loadVideo() {
        setShowMe(true);
        youtubePlayer.current.loadVideoById(videoID.split("=")[1]);
        setVideoID("");  
        if (ytDataChannel.current && ytDataChannel.current.readyState === 'open' && videoID.length > 0) {
            console.log("send the data brooo");
            ytDataChannel.current.send(JSON.stringify({ type: 'load', data: { 'videoID': videoID.split("=")[1] } }));
        }
        console.log({'ytChannel' : ytDataChannel});
    }
    function startVideo(){
        youtubePlayer.current.playVideo();
    }
    function stopVideo(){
        youtubePlayer.current.pauseVideo();
    }
    function skipVideo(){
        const currentTime = youtubePlayer.current.getCurrentTime();
        youtubePlayer.current.seekTo(currentTime+5);
    }

    return (
        <div>
            <h1 className="text-lg font-medium">Youtube</h1>
            <div id="player" />
            <div  className="m-4"> 
            <input type="text" placeholder="video link" value={videoID} onChange={e => setVideoID(e.target.value)} />
            <div>
            <button onClick={loadVideo} className="text-lg font-medium m-1">Load video</button>
            <button onClick={startVideo}className="text-lg font-medium m-1">Start video</button>
            <button onClick={stopVideo}className="text-lg font-medium m-1 ">Stop video</button>
            <button onClick={skipVideo}className="text-lg font-medium m-1">Skip by 5 Sec</button>
            </div>
            
            </div>
        </div>
    );
}

export default YoutubeVideos;
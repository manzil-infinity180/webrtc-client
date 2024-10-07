import { useEffect, useRef, useState } from "react";
import YoutubeContent from "./YoutubeContent";
import Navbar from "./Navbar";

function YoutubeVideos({ peerConnection }) {
  const [videoID, setVideoID] = useState("");
  const [showMe, setShowMe] = useState(false);
  const youtubePlayer = useRef();
  const ytDataChannel = useRef();
  useEffect(() => {
    const ytChannel = peerConnection.createDataChannel("youtube");
    console.log("ytChannel");
    console.log({ ytChannel });
    ytDataChannel.current = ytChannel;
    ytChannel.onopen = (e) => {
      console.log("Youtube channel is open now");
      console.log({ ytChannel: e });
    };
    ytChannel.onopen = (e) => {
      console.log("Youtube channel is closed now");
      console.log({ ytChannel: e });
    };
    ytChannel.onmessage = (event) => {
      console.log("Message received:", event.data);
      const { type } = JSON.parse(event.data);
      console.log(type);
      console.log(type === "load");
      if (type === "load") {
        console.log("Hello here");
        const { data } = JSON.parse(event.data);
        youtubePlayer.current.loadVideoById(data.videoID);
      }
      if (type === "sync") {
        const { data } = JSON.parse(event.data);
        youtubePlayer.current.seekTo(data.time, true);
        if (data.state === 1) youtubePlayer.current.playVideo();
        else if (data.state === 2) youtubePlayer.current.pauseVideo();
      }
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    window.onYouTubeIframeAPIReady = loadVideoPlayer;
  }, []);

  function loadVideoPlayer() {
    console.log("hello");
    const player = new window.YT.Player("player", {
      height: "390",
      width: "640",
      playerVars: {
        autoplay: 0,
        playsinline: 1,
      },
      events: {
        // 'onReady': onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });
    youtubePlayer.current = player;
    console.log(ytDataChannel.current);
  }

  const onPlayerStateChange = (event) => {
    console.log({ onPlayerStateChannel: event });
    console.log(ytDataChannel.current);
    if (ytDataChannel.current && ytDataChannel.current.readyState === "open") {
      const state = event.data;
      console.log("yeah bro i am here");
      const time = youtubePlayer.current.getCurrentTime();
      console.log({ time, state });
      console.log("send the data brooo");
      ytDataChannel.current.send(
        JSON.stringify({ type: "sync", data: { state, time } })
      );
    }
  };

  function loadVideo(videoID) {
    setShowMe(true);
    youtubePlayer.current.loadVideoById(videoID.split("=")[1]);
    setVideoID("");
    if (
      ytDataChannel.current &&
      ytDataChannel.current.readyState === "open" &&
      videoID.length > 0
    ) {
      console.log("send the data brooo");
      ytDataChannel.current.send(
        JSON.stringify({
          type: "load",
          data: { videoID: videoID.split("=")[1] },
        })
      );
    }
    console.log({ ytChannel: ytDataChannel });
  }
  function startVideo() {
    youtubePlayer.current.playVideo();
  }
  function stopVideo() {
    youtubePlayer.current.pauseVideo();
  }
  function skipVideo() {
    const currentTime = youtubePlayer.current.getCurrentTime();
    youtubePlayer.current.seekTo(currentTime + 5);
  }

  return (
    <>
      <Navbar></Navbar>
      <div className="flex-wrap w-full overflow-x-hidden">
        <h1 className="text-3xl font-mono text-center my-2">Youtube</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12 w-full max-w-full">
          <div id="player" className="rounded-md max-w-full" />
          <div className="w-full">
            <YoutubeContent onVideoSelect={loadVideo} />
          </div>
        </div>
        <div className="m-0 flex flex-col items-center w-full">
          <input
            type="text"
            placeholder="video link"
            value={videoID}
            className="bg-gray-200 outline-none border border-gray-300 font-mono rounded px-4 py-2 w-4/5 my-1 md:flex-1 md:w-1/4 md:my-3 transition-all focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setVideoID(e.target.value)}
            autoComplete="false"
          />
          <div className="flex flex-wrap justify-center w-full">
            <button
              onClick={() => loadVideo(videoID)}
              className="btn btn-secondary mt-4 font-medium m-1 px-2 py-1 text-lg text-white border border-white font-serif rounded bg-blue-500"
            >
              Load video
            </button>
            <button
              onClick={startVideo}
              className="btn btn-secondary mt-4 font-medium m-1 px-2 py-1 text-lg border border-white font-serif rounded bg-yellow-300"
            >
              Start video
            </button>
            <button
              onClick={stopVideo}
              className="btn btn-secondary mt-4 font-medium m-1 px-2 py-1 text-lg text-white border border-white font-serif rounded bg-red-600"
            >
              Stop video
            </button>
            <button
              onClick={skipVideo}
              className="btn btn-secondary mt-4 font-medium m-1 px-2 py-1 text-lg border border-white font-serif rounded bg-yellow-300"
            >
              Skip by 5 Sec
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default YoutubeVideos;

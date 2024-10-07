import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import p2p from "../utils/p2p_image.png";
import code_editor from "../utils/code_editor.png";
import one_many from "../utils/one_many.png";
import Navbar from "./Navbar";
export function Home() {
  const [meetingId, setMeetingId] = useState("");
  const navigate = useNavigate();
  function handleMeetingId(e) {
    setMeetingId(e.target.value);
  }
  return (
    <>
      <Navbar />
      <div className="bg-gray-100 flex flex-col flex-wrap">
        <div className="flex justify-center mt-4 text-2xl sm:text-3xl font-serif">
          Real Time Interactive Portal
        </div>
        <div className="bg-white shadow-lg rounded-md flex justify-center m-10 my-6 md:mx-25 lg:mx-40 flex-wrap">
          <div className="flex justify-start space-x-4 mb-4">
            <img
              src={p2p}
              className="w-80 h-52 m-4 md:w-96 md:h-60"
              loading="lazy"
            />
          </div>
          <div className="mx-12 flex justify-center flex-col mb-6">
            <h4 className="m-1 text-xl text-center mt-4 font-mono bg-blue-100 opacity-85 rounded">
              Peer to Peer Communication
            </h4>
            <p className="mt-1 text-center font-serif">
              P2P call, Yt Video, Messenging and Transfer files
            </p>
            <button
              className="text-xl font-serif rounded border bg-violet-500 text-white py-1"
              onClick={() => navigate(`/meeting/join`)}
            >
              Lets Do Peer : Peer
            </button>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-md flex justify-center mx-10 my-6 md:mx-25 lg:mx-40 flex-wrap">
          <div className="flex justify-start space-x-4 mb-4">
            <img
              src={code_editor}
              className="w-80 h-52 m-4 md:w-96 md:h-60"
              loading="lazy"
            />
          </div>
          <div className="mx-12 flex justify-center flex-col mb-6 flex-wrap">
            <h4 className="text-xl text-center mt-4 m-1 font-mono bg-yellow-100 opacity-85 rounded">
              Interview P2P
            </h4>
            <p className="mt-1 text-center font-serif ">
              Collobrative Code Editor and P2P Interaction
            </p>
            <button
              className="mx-12 my-4 text-xl font-serif rounded border bg-violet-500 text-white py-1"
              onClick={() => navigate(`/code/join`)}
            >
              Lets Do 1:1 And Code Editor
            </button>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-md flex justify-center mx-10 my-6 md:mx-25 lg:mx-40 flex-wrap">
          <div className="flex justify-start space-x-4 mb-4">
            <img
              src={one_many}
              className="w-80 h-52 m-4 md:w-96 md:h-60"
              loading="lazy"
            />
          </div>
          <div className="mx-12 flex justify-center flex-col mb-6 flex-wrap">
            <h4 className="m-1 text-xl text-center mt-4 font-mono bg-pink-100 opacity-85 rounded">
              One to Many VideoCall
            </h4>
            <p className="mt-0 pt-0 text-center font-serif mx-2">
              Interact with your 3-4 friends with Video/Audio{" "}
            </p>
            <button
              className="mx-12 my-4 text-xl font-serif text-white rounded border bg-violet-500 py-1"
              onClick={() => navigate(`/zoom/call`)}
            >
              Lets Do One : Many
            </button>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-md flex justify-center mx-10 my-6 md:mx-25 lg:mx-40 flex-wrap">
          <div className="flex justify-start space-x-4 mb-4">
            <img
              src={
                "https://lh3.googleusercontent.com/3zkP2SYe7yYoKKe47bsNe44yTgb4Ukh__rBbwXwgkjNRe4PykGG409ozBxzxkrubV7zHKjfxq6y9ShogWtMBMPyB3jiNps91LoNH8A=s500"
              }
              className="w-80 h-52 m-4 md:w-96 md:h-60"
              loading="lazy"
            />
          </div>
          <div className="mx-12 flex justify-center flex-col mb-6">
            <h4 className="m-1 text-xl text-center mt-4 font-mono bg-pink-100 opacity-85 rounded">
              Free Youtube - Search & URL
            </h4>
            <p className="mt-0 pt-0 text-center font-serif">
              I guess you will not get Any ADs
            </p>
            <button
              className="mx-12 my-4 text-xl font-serif text-white rounded border bg-violet-500 py-1"
              onClick={() => navigate(`/ytContent`)}
            >
              Lets Watch Youtube
            </button>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-md flex justify-center mx-10 my-6 md:mx-25 lg:mx-40 flex-wrap">
          <div className="flex justify-start space-x-4 mb-4">
            <img
              src={one_many}
              className="w-80 h-52 m-4 md:w-96 md:h-60"
              loading="lazy"
            />
          </div>
          <div className="mx-12 flex justify-center flex-col mb-6">
            <h4 className="m-1 text-xl text-center mt-4 font-mono bg-pink-100 opacity-85 rounded">
              Zoom Integration
            </h4>
            <p className="mt-0 pt-0 text-center font-serif mx-2">
              Join the meeting using Meeting Id and Password
            </p>
            <button
              onClick={() => navigate("zoom/call")}
              className="mx-14 my-4 text-xl font-serif text-white rounded border bg-violet-500 py-1"
            >
              {" "}
              Lets Do Zoom Meeting{" "}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

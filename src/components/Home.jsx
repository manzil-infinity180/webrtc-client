import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import p2p from "../utils/p2p_image.png";
import code_editor from "../utils/code_editor.png";
import one_many from "../utils/one_many.png";

export function Home() {
  const [meetingId, setMeetingId] = useState("");
  const navigate = useNavigate();
  
  function handleMeetingId(e) {
    setMeetingId(e.target.value);
  }
  
  return (
    <>
      <div className="bg-gray-100 flex flex-col flex-wrap">
        <div className="flex justify-center mt-4 text-2xl sm:text-3xl font-serif">
          Real Time Interactive Portal
        </div>

        {/* Peer to Peer Communication */}
        <div className="bg-white shadow-lg rounded-md flex justify-center m-10 my-6 md:mx-25 lg:mx-40 flex-wrap">
          <div className="flex justify-start space-x-4 mb-4">
            <img
              src={p2p}
              className="w-80 h-52 m-4 md:w-96 md:h-60"
              loading="lazy"
              alt="P2P Communication"
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

        {/* Interview P2P */}
        <div className="bg-white shadow-lg rounded-md flex justify-center mx-10 my-6 md:mx-25 lg:mx-40 flex-wrap">
          <div className="flex justify-start space-x-4 mb-4">
            <img
              src={code_editor}
              className="w-80 h-52 m-4 md:w-96 md:h-60"
              loading="lazy"
              alt="Code Editor"
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

        {/* NEW: AI Interview with Proctoring */}
        <div className="bg-white shadow-lg rounded-md flex justify-center mx-10 my-6 md:mx-25 lg:mx-40 flex-wrap border-2 border-indigo-200">
          <div className="flex justify-start space-x-4 mb-4">
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop"
              className="w-80 h-52 m-4 md:w-96 md:h-60 object-cover rounded"
              loading="lazy"
              alt="AI Interview"
            />
          </div>
          <div className="mx-12 flex justify-center flex-col mb-6 flex-wrap">
            <div className="flex items-center justify-center gap-2">
              <h4 className="text-xl text-center mt-4 m-1 font-mono bg-gradient-to-r from-indigo-100 to-purple-100 opacity-85 rounded px-3 py-1">
                AI Interview with Proctoring
              </h4>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold mt-4">
                NEW
              </span>
            </div>
            <p className="mt-1 text-center font-serif">
              AI-powered technical interview with real-time proctoring
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1">
              <li>✓ AI-generated coding questions</li>
              <li>✓ Real-time cheating detection</li>
              <li>✓ Automated code evaluation</li>
              <li>✓ Head pose & gaze tracking</li>
            </ul>
            <button
              className="mx-12 my-4 text-xl font-serif rounded border bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
              onClick={() => {
                const newMeetingId = uuidv4();
                navigate(`/interview/${newMeetingId}`);
              }}
            >
              Start AI Interview 🎯
            </button>
          </div>
        </div>

        {/* One to Many VideoCall */}
        <div className="bg-white shadow-lg rounded-md flex justify-center mx-10 my-6 md:mx-25 lg:mx-40 flex-wrap">
          <div className="flex justify-start space-x-4 mb-4">
            <img
              src={one_many}
              className="w-80 h-52 m-4 md:w-96 md:h-60"
              loading="lazy"
              alt="One to Many"
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

        {/* Free Youtube */}
        <div className="bg-white shadow-lg rounded-md flex justify-center mx-10 my-6 md:mx-25 lg:mx-40 flex-wrap">
          <div className="flex justify-start space-x-4 mb-4">
            <img
              src={
                "https://lh3.googleusercontent.com/3zkP2SYe7yYoKKe47bsNe44yTgb4Ukh__rBbwXwgkjNRe4PykGG409ozBxzxkrubV7zHKjfxq6y9ShogWtMBMPyB3jiNps91LoNH8A=s500"
              }
              className="w-80 h-52 m-4 md:w-96 md:h-60"
              loading="lazy"
              alt="Youtube"
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

        {/* Zoom Integration */}
        <div className="bg-white shadow-lg rounded-md flex justify-center mx-10 my-6 md:mx-25 lg:mx-40 flex-wrap">
          <div className="flex justify-start space-x-4 mb-4">
            <img
              src={one_many}
              className="w-80 h-52 m-4 md:w-96 md:h-60"
              loading="lazy"
              alt="Zoom"
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
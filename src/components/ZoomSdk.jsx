import ZoomMtgEmbedded from "@zoom/meetingsdk/embedded";
import { useState } from "react";
import Navbar from "./Navbar";

function ZoomSdk() {
  const [values, setValues] = useState({
    passWord: "",
    meetingNumber: "",
    userName: "Username",
    visibility: true,
  });

  const client = ZoomMtgEmbedded.createClient();
  let authEndpoint = import.meta.env.VITE_AUTH_ENDPOINT;
  let sdkKey = import.meta.env.VITE_CLIENT_ID;
  let meetingNumber = 4930462975;
  let passWord = import.meta.env.VITE_PASSWORD;
  let role = 0;
  let userName = import.meta.env.VITE_USERNAME;
  let userEmail = "";
  let registrantToken = "";
  let zakToken = "";
  let leaveUrl = "http://localhost:5173/";

  function handleJoinFunctionality(e) {
    if (values.meetingNumber.length && values.passWord.length) {
      setValues((s) => ({ ...s, visibility: false }));
      getSignature(e);
    }
  }

  async function getSignature(e) {
    e.preventDefault();
    await fetch(authEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        meetingNumber: Number(values.meetingNumber),
        role: role,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        startMeeting(data.signature);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function startMeeting(signature) {
    let meetingSDKElement = document.getElementById("meetingSDKElement");
    client
      .init({
        leaveUrl: leaveUrl,
        zoomAppRoot: meetingSDKElement,
        language: "en-US",
        patchJsMedia: true,
        leaveOnPageUnload: true,
      })
      .then(() => {
        client
          .join({
            signature: signature,
            sdkKey: sdkKey,
            meetingNumber: Number(values?.meetingNumber),
            password: values?.passWord,
            userName: values.userName,
          })
          .then(() => {
            console.log("joined successfully");
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <>
      <Navbar></Navbar>
      {values.visibility && (
        <div className="flex flex-col justify-center items-center py-1 bg-gray-50 min-h-screen">
          <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-8">
            <div className="text-center mb-6">
              <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-4xl">
                Join a Zoom Meeting
              </h1>
              <p className="text-gray-600">Enter your details to join</p>
            </div>

            <form onSubmit={handleJoinFunctionality}>
              <div className="grid gap-6 mb-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="meetingNumber"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Meeting Number
                  </label>
                  <input
                    type="text"
                    id="meetingNumber"
                    value={values.meetingNumber}
                    onChange={(e) =>
                      setValues({ ...values, meetingNumber: e.target.value })
                    }
                    className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="Meeting Number"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="passWord"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="passWord"
                    value={values.passWord}
                    onChange={(e) =>
                      setValues({ ...values, passWord: e.target.value })
                    }
                    className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="Meeting Password"
                    required
                  />
                </div>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="userName"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="userName"
                  onChange={(e) =>
                    setValues({ ...values, userName: e.target.value })
                  }
                  className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="UserName"
                  required
                />
              </div>
              <button
                type="submit"
                className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center cursor-pointer"
              >
                Join Meeting
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        {!values.visibility && <div id="meetingSDKElement"></div>}
      </div>
    </>
  );
}

export default ZoomSdk;

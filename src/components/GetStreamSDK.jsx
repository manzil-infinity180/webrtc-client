import { useEffect, useState } from 'react';

import {
  Call,
  CallControls,
  CallingState,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import './getStreamSdk.css'; 

const apiKey = import.meta.env.VITE_GET_STREAM_APIKEY;
const token = import.meta.env.VITE_GET_STREAM_TOKEN;
const userId = import.meta.env.VITE_GET_STREAM_USERID;
const callId = import.meta.env.VITE_GET_STREAM_CALLID;

// set up the user object
const user = {
    id: userId,
    name: 'Oliver',
    image: 'https://getstream.io/random_svg/?id=oliver&name=Oliver',
  };

const client = new StreamVideoClient({ apiKey, user, token });


export default function GetStreamSDK() {
    const [call, setCall] = useState(null);

     useEffect(() => {
    const myCall = client.call('default', callId);
    myCall.join({ create: true }).catch((err) => {
      console.error(`Failed to join the call`, err);
    });
    setCall(myCall);

    return () => {
      setCall(null);
      myCall.leave().catch((err) => {
        console.error(`Failed to leave the call`, err);
      });
    };
}, []);
if (!call) return null;

return (
  <StreamVideo client={client}>
    <StreamCall call={call}>
      <MyUILayout />
    </StreamCall>
  </StreamVideo>
);
}

export const MyUILayout = () => {
    // const call = useCall();
  
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) {
    return <div>Loading...</div>;
  }

  return (
    <StreamTheme>
      <SpeakerLayout participantsBarPosition="bottom" />
      <CallControls />
    </StreamTheme>
  );
};

// export const MyParticipantList = ({ participants }) => {
//     return (
//       <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
//         {participants && participants.map((participant) => (
//           <ParticipantView participant={participant} key={participant.sessionId} />
//         ))}
//       </div>
//     );
// };

// export const MyFloatingLocalParticipant = ({participant}) => {
//     // const { participant } = props;
//     return (
//       <div
//         style={{
//           position: 'absolute',
//           top: '15px',
//           left: '15px',
//           width: '240px',
//           height: '135px',
//           boxShadow: 'rgba(0, 0, 0, 0.1) 0px 0px 10px 3px',
//           borderRadius: '12px',
//         }}
//       >
//         {participant && <ParticipantView participant={participant} />}
//       </div>
//     );
// };
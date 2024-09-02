import ZoomMtgEmbedded from '@zoom/meetingsdk/embedded'
import { useState } from 'react';
function ZoomSdk() {
    const [values,setValues] = useState({
        passWord:'',
        meetingNumber:'',
        userName:'Username',
        visibility: true
    });
    const client = ZoomMtgEmbedded.createClient();
    let authEndpoint = import.meta.env.VITE_AUTH_ENDPOINT
    let sdkKey = import.meta.env.VITE_CLIENT_ID
    let meetingNumber = 4930462975
    let passWord = import.meta.env.VITE_PASSWORD
    let role = 0
    let userName = import.meta.env.VITE_USERNAME
    let userEmail = ''
    let registrantToken = ''
    let zakToken = ''
    let leaveUrl = 'http://localhost:5173/';

    function handleJoinFunctionality(e){
        
        if(values.meetingNumber.length && values.passWord.length){
            setValues((s) => ({...s,visibility:false}));
            getSignature(e);
        }
        
    }
    async function getSignature(e) {
        e.preventDefault();
        console.log(authEndpoint);
        await fetch(authEndpoint, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                meetingNumber: Number(values.meetingNumber),
                role: role
            })
        }).then(async (res) => {
            const data = await res.json();
            console.log(data);
            startMeeting(data.signature);
        }).catch((err) => {
            console.log(err);
        });
        function startMeeting(signature) {
            let meetingSDKElement = document.getElementById('meetingSDKElement');
            client.init({
                leaveUrl: leaveUrl,
                zoomAppRoot: meetingSDKElement, language: 'en-US',
                patchJsMedia: true, leaveOnPageUnload: true
            }).then(() => {
                client.join({
                    signature: signature,
                    sdkKey: sdkKey,
                    meetingNumber: Number(values?.meetingNumber),
                    password: values?.passWord,
                    userName: values.userName,
                    // userEmail: userEmail,
                    tk: '',
                    // zak: zakToken
                }).then(() => {
                    console.log('joined successfully')
                  }).catch((error) => {
                    console.log(error)
                  })
                }).catch((error) => {
                  console.log(error)
                })
            };
        }
        return (
            <>
            {values.visibility && <div className='flex flex-col justify-center'>
                <div className='flex justify-center'>
                    <span className="text-2xl sm:text-3xl font-serif mb-4 mt-0 bg-pink-200 text-center rounded px-4">
                       Zoom Integration
                    </span>
                </div>
            <div className='flex flex-col justify-center items-center mt-5'>
                <input type='text' name='meetingNumber' 
                className="m-2 bg-gray-200 outline-none border font-mono rounded px-4 py-2 w-1/3"
                placeholder='Enter Your username'
                value={values.userName} onChange={(e) => setValues(s => ({...s,userName:e.target.value}))}/>
                <input type='text' name='meetingNumber' 
                placeholder='Meeting Number'
                className="m-2 bg-gray-200 outline-none border font-mono rounded px-4 py-2 w-1/3"
                required value={values.meetingNumber} onChange={(e) => setValues(s => ({...s,meetingNumber:e.target.value}))}/>
                <input type="text" name='passWord'required 
                placeholder='Meeting Password'
                className="m-2 bg-gray-200 outline-none border font-mono rounded px-4 py-2 w-1/3"
                value={values.passWord} onChange={(e) => setValues(s => ({...s,passWord:e.target.value}))}
                />
                <button onClick={(e) => handleJoinFunctionality(e)}
             className="btn btn-secondary mt-4 font-medium m-1 px-4 py-1 text-lg text-white border border-white font-serif rounded bg-blue-500"
             >Join Meeting</button>
            </div>
            </div>}
            <div className='flex justify-center'>
             {!values.visibility &&<div id="meetingSDKElement"> </div>   }

            </div>
             </>
        );
    }

    export default ZoomSdk;
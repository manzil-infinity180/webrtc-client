import ZoomMtgEmbedded from '@zoom/meetingsdk/embedded'
function ZoomSdk() {
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

    async function getSignature(e) {
        e.preventDefault();
        console.log(authEndpoint);
        await fetch(authEndpoint, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                meetingNumber: meetingNumber,
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
                    meetingNumber: meetingNumber,
                    password: passWord,
                    userName: userName,
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
            <div>
                <div id="meetingSDKElement"> </div>
                <button onClick={getSignature}>Join Meeting</button>
            </div>
        );
    }

    export default ZoomSdk;
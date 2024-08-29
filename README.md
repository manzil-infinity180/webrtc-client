# Real Time Interactive Portal

## What are the feature of this application?
 * It is `Peer to Peer Collobartive application`, where person can share their video , share screen, send messages, transfer files, watch youtube video
 * You can play `Youtube videos` at same time in two tab, i mean with your friend
 * Peer to Peer Video call functionality with the Code Editor `(Best use for Interview)`
 * Code Editor supports `multiple languages` like c, c++, java, python, javascript/typescript, golang and many more.

<p align="center">
<img src ="https://github.com/user-attachments/assets/98c93312-e8e2-4c50-a897-ff9ae8cb2d58" width="540px" height="540px" />
</p>

 ----------------------------------------------------------------------------
## Tools, Technology
* `Frontend`
   - ReactJS, TailwindCSS - For UI
   - WebRTC - for setting up Peer to Peer Communication
   - Monaco - Code Editor
   - Yjs - It makes our Code Editor Collobrative
   - Socket.io - Serve as Signaling Server

* `Backend`
  - NodeJs, Express
  - Socket.io - for setting up signaling server

 ----------------------------------------------------------------------------
 ## Introduction to Our Tools and Technology 
 ### WebRTC
 So, webrtc is used for setting up peer to peer connection with the video, voice supports.\
 WebRTC - Web Real Time Communication 
 We can build powerful video and voice communication on webpages that works across the browser and devices.\
 Wheather you are building the peer to peer video, content sharing, messaging or chat tools , Webrtc makes coding easy and the end experience user friendly\
* WebRTC uses SRTP (Secure Real time Transport protocol) to encrypt authenticate and protect your data and conversation\
* `WebRTC Architecture`
 <p align="center">
<img src ="https://github.com/user-attachments/assets/d5e88f5b-5d85-4ebb-99db-34676935c99c" width="540px" height="120px" />
</p>

* P2P is for 2 person as it is clear from their name Peer-to-Peer Communication
* So if we want to go 1 to Many (1:Many) then we have choose to create `Mesh`, SFU and MCU but in Mesh we can not create more connection suppose(1:10) it is really difficult to handle it and we need really good cpu  power computer.\
* Forwarding WebRTC media is a complex operation that consumes a lot of bandwidth, especially video.\
* Encoding media multiple times can burn cycles on a device's CPU, which can cause the device to heat up and deplete its battery. `(WE CAN'T SCALE MESH TO GREAT EXTENT)`

 <p align="center">
<img src ="https://miro.medium.com/v2/resize:fit:864/format:webp/1*08CWt1c1-gLz4zEVomhOZw.png" width="360px" height="280px" />
</p>

* `SFU - Selective Forwarding Unit `
  - It only need to send and receive media from each party. This means that an SFU can support a much larger number of parties than a P2P connection
<p align="center">
<img src ="https://github.com/user-attachments/assets/1e53c30c-c97b-490a-88c1-9716682dd1fc" width="360px" height="280px" />
</p>

* `MCU - Multipoint Control Unit`
  
<p align="center">
<img src ="https://github.com/user-attachments/assets/574a4e7b-d986-4513-ad0f-2bf79599820a" width="360px" height="280px" />
</p>

[Read More About WebRTC Architecture](https://getstream.io/blog/what-is-a-selective-forwarding-unit-in-webrtc/)

### KeyWords Which you will hear alot during reading docs about WebRTC 
* STUN/TURN Server
* UDP/TCP Protocol
* ICE Candidate 
* SDP
* Signaling Server
* Create Offer / Answer Offer
* RTCPeerConnection / RTCDataChannel / MediaRecorder / GUM - getUserMedia
* setLocalDescription / setRemoteDescription

  - Lets Discuss little bit about these keywords
     
    ![peer to peer connection firewall, nat and udp diagram](https://github.com/user-attachments/assets/9dbef2eb-2ce1-48e1-b67e-56061acffe0d)

    
<!--- ![photo_6188121891928130590_x (1)](https://github.com/user-attachments/assets/6792ce1b-8a99-4a66-afc1-bde99351a081) -->

![image](https://github.com/user-attachments/assets/c6867c8d-e179-448b-9b8a-6cbd23b7d4c6)

### ICE Candidate 
Ice Candidate is a framework to allow your web browser to connect with peers\
* Why we can't directly connect with the other peers?
It is due to firewall, NAT which restrict to connect directly with the other peers, it need to bypass the firewall that prevent opening connection, give you unique address in most
situation your device does not have  a public ip address and relay data through a server if your router does not allow you to directly connect with the  peer.\
* How we get the ICE Candidate - It is due to the STUN / TURN Server
* Ice Candidate in computer networking to find way for two computer  to talk to each other as directly as possible in peer to peer networking. Commonly used for interative media such as
  voice over Internet Protocol(VoIP), peer to peer communication, instant messanging. In such type of application comm. b/w client  is really difficult on the internet due  to firewall and other 
  network barrier such as NAT(Network address translator) and communication through central server is slow and expensive

### STUN - Session Transveral Utilities for NAT (help to discover the public ip address)
So, it is protocol that used for discover the public ip address and determine any restriction in your router that would prevent a direct connection with the peer.

```js
let peerConnection = new RTCPeerConnection({
    iceServers: [{
        urls: "stun:stun.l.google.com:19302",
    },],
});
```

![image](https://github.com/user-attachments/assets/43376014-e9df-46b6-919c-5d5a1c192390)


### TURN - Traversal Using Relays around NAT (Upgrade Version of STUN)
So, see the previous image which i shared in the STUN - when the peer B requested to STUN server WHO I AM? the response came here is Symmetric NAT it means the router have some Restriction and it preventing it to  connect with peer on internet. To overcome from such type of problem we can use TURN Server which is just the upgrade version of STUN Server. 

- Some router using NAT employ a restriction -> Symmetric NAT which means the router will only accept connection from peers you've previously connected to, so use TURN.
```js
const iceConfiguration = {
    iceServers: [
        {
            urls: 'turn:my-turn-server.mycompany.com:19403',
            username: 'optional-username',
            credential: 'auth-token'
        }
    ]
}
const peerConnection = new RTCPeerConnection(iceConfiguration);
```
![image](https://github.com/user-attachments/assets/b1a631b0-3436-40a7-9f6c-39898fc8aa3d)

### NAT - Network Address Translation (Prevent Peer to direct connect with other peer)
Network Address Translation (NAT) is a service that enables private IP networks to use the internet and cloud. NAT translates private IP addresses in an internal network to a public IP address before packets are sent to an external network.(It is used to give your device a public IP Address)
A router will have a public IP  address and every device connected to the router will have a private IP address.\
Request will be translted from the device private IP to the router public IP with the unique port. That way you don't need a unique public IP address but can still be discovered on the Internet.


### SDP - Session Description Protocoll (To describe the multimedia content)
It is standard for describing the multimedia content of the connection such as resolution, format, codecs, encryption. So that both peer con understand  each other data is transferring\
* Techincally SDP is not truly a protocol but a data format used to describe connection that shares media b/w devices.
* 
![image](https://github.com/user-attachments/assets/2cb10ca3-0275-46b8-8bb4-af823ef0d9bd)

### Steps which must occur to exchange the offer and answer, leaving out the ICE layer for the moment:

1) GUM - [getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
   The getUserMedia() method of the MediaDevices interface prompts the user for permission to use a media input which produces a MediaStream with tracks containing the requested types of media.

  ```js
   // get access for media input  - getUserMedia
     window.navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            setLocalStream(stream);
     });
   // want to share screen - getDisplayMedia
    await window.navigator.mediaDevices.getDisplayMedia({ video: true });
    const screenTrack = screenStream.getVideoTracks()[0];
  ```

2) Create RTCPeerConnection and add the track (addTrack) `peerConnection.addTrack(localStream.getVideoTracks()[0]);`
3) RTCPeerConnection createOffer and set the local description(setLocalDescription)
   
   ```js
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
   ```
4) After setLocalDescription(), the caller asks STUN servers to generate the ice candidates
5) Signaling server to transmit the offer
   - Connect to socket.io
     
     ```js
     const URL = 'http://localhost:5006'
     const socketIo = io(URL, {
            transports: ['websocket', 'polling', 'flashsocket'],
        });

     ```
   - Transmit Offer and set the RemoteDescription
  
     ```js
     socketIo.on('localDescription', async ({ description }) => {
            console.log({ description });
            peerConnection.setRemoteDescription(description);
            peerConnection.ontrack = (e) => {
                console.log({ 'ontrackEvent': e.track });
                setRemoteStream(new MediaStream([e.track]));
            }

            socketIo.on('iceCandidate', ({ candidate }) => {
                peerConnection.addIceCandidate(candidate);
            });

            peerConnection.onicecandidate = ({ candidate }) => {
                socketIo.emit('iceCandidateReply', {
                    candidate
                });
            }
     
            // ANSWer
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            socketIo.emit('remoteDescription', { description: peerConnection.localDescription });
        });

     ```
  6) Other End -> GUM -> addTrack() -> createAnswer   

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




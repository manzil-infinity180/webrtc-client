import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import { Home } from './components/Home';
import {Meeting} from './components/Meeting';
import { ScreenShare } from './components/ScreenShare';
import { MessageBot } from './components/MessageBot';
import MyEditor from './components/CodeEditor';
import { Toaster } from "react-hot-toast"
import YoutubeVideos from './components/YoutubeVideos';
import YoutubeContent from './components/YoutubeContent';
import MonacoCodeEditor from './components/MonacoCodeEditor';
import Interview from './components/Interview';
import ZoomSdk from './components/ZoomSdk';
// import './index.css'
function App() {
  const router = createBrowserRouter([
    {
      path: '*',
      element: <Home />
    },
    {
      path: '/meeting/:meetingId',
      element: <Meeting />
    },
    {
      path: '/screen/:meetingId',
      element: <ScreenShare />
    },
    {
      path:'/chat/:meetingId',
      element: <MessageBot />
    },
    {
      path:'/editor',
      element: <MonacoCodeEditor />
    },
    {
      path:'/yt',
      element: <YoutubeVideos />
    },
    {
      path:'/content',
      element: <YoutubeContent />
    },
    {
      path:'/code/:meetingId',
      element: <Interview />
    },
    {
      path:'/zoom/call',
      element: <ZoomSdk />
    }
  ]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            success: {
              style: {
                backgroundColor: "white",
                color: "green",
                border: "1px solid green",
                padding: "15px",
                marginRight: "20px",
              },
              iconTheme: {
                primary: "green",
                secondary: "white",
              },
            },
            error: {
              style: {
                backgroundColor: "white",
                color: "red",
                border: "1px solid red",
                padding: "15px",
                marginRight: "20px",
              },
              iconTheme: {
                primary: "red",
                secondary: "white",
              },
            },
          }}
        />
    </>
  )
}

export default App

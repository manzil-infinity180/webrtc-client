import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import { Home } from './components/Home';
import {Meeting} from './components/Meeting';
import { ScreenShare } from './components/ScreenShare';
import { MessageBot } from './components/MessageBot';
import MyEditor from './components/CodeEditor';
import YoutubeVideos from './components/YoutubeVideos';
import YoutubeContent from './components/YoutubeContent';
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
      element: <MyEditor />
    },
    {
      path:'/yt',
      element: <YoutubeVideos />
    },
    {
      path:'/content',
      element: <YoutubeContent />
    }
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App

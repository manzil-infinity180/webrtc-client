import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import { Home } from './components/Home';
import {Meeting} from './components/Meeting';
import { ScreenShare } from './components/ScreenShare';
import { MessageBot } from './components/MessageBot';

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
    }
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App

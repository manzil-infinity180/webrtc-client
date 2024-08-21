import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import { Home } from './components/Home';
import {Meeting} from './components/Meeting';
import { ScreenShare } from './components/ScreenShare';

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
    }
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App

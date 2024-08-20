import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import { Home } from './components/Home';
import {Meeting} from './components/Meeting';

function App() {
  const router = createBrowserRouter([
    {
      path: '*',
      element: <Home />
    },
    {
      path: '/meeting/:meetingId',
      element: <Meeting />
    }
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App

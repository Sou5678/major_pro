import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import App from './App';
import Home, { uploadResumeAction } from './screens/Home';
import Profile from './screens/Profile';
import Login, { loginAction } from './screens/Login';
import Signup, { signupAction } from './screens/Signup';
import RouteError from './screens/RouteError';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        element: <Home />,
        action: uploadResumeAction,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'login',
        element: <Login />,
        action: loginAction,
      },
      {
        path: 'signup',
        element: <Signup />,
        action: signupAction,
      },
    ],
  },
]);

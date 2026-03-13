import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import App from './App';
import Home, { uploadResumeAction } from './screens/Home';
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
    ],
  },
]);

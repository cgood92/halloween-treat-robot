import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const LazyHead = React.lazy(() => import("./Head"));
const LazyHalloween = React.lazy(() => import("./Halloween"));
const LazyVoice = React.lazy(() => import("./Voice"));

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

const router = createBrowserRouter([
  {
    path: "/voice",
    element: <LazyVoice />,
  },
  {
    path: "/dialogue",
    element: <LazyHalloween />,
  },
  {
    path: "/head",
    element: <LazyHead />,
  },
]);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

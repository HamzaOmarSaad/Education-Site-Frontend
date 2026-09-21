import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import routing from "./router/AppRouter";
import { Toaster } from "react-hot-toast";
import UserContextProvider from "./context/userContext/userContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster position="top-right" />
    <UserContextProvider>
      <RouterProvider router={routing} />
    </UserContextProvider>
  </StrictMode>,
);

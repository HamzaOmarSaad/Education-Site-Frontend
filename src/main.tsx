import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import routing from "./router/AppRouter";
import { Toaster } from "react-hot-toast";
import UserContextProvider from "./context/userContext/userContext";
import { LanguageProvider } from "./context/language/LanguageContext";
import StandaloneLanguageToggle from "./components/LanguageToggle/StandaloneLanguageToggle";
import { ThemeInit } from "../.flowbite-react/init";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeInit />
    <Toaster position="top-right" />
    <LanguageProvider>
      <UserContextProvider>
        <RouterProvider router={routing} />
        <StandaloneLanguageToggle />
      </UserContextProvider>
    </LanguageProvider>
  </StrictMode>,
);

import { type ReactNode } from "react";
import { Navigate } from "react-router";

function ProtectedRoutes({ children }: { children: ReactNode }) {
  if (localStorage.getItem("token")) {
    return children;
  } else {
    return <Navigate to={"/login"} />;
  }
}

export default ProtectedRoutes;

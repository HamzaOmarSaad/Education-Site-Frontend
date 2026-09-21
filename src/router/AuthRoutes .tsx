import { type ReactNode } from "react";
import { Navigate } from "react-router";

function AuthRoutes({ children }: { children: ReactNode }) {
  if (!localStorage.getItem("token")) {
    return children;
  } else {
    return <Navigate to={"/student-dashboard"} />;
  }
}

export default AuthRoutes;

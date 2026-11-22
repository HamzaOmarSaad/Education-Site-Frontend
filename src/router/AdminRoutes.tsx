import { type ReactNode } from "react";
import { Navigate } from "react-router";

function AdminRoutes({ children }: { children: ReactNode }) {
  if (localStorage.getItem("adminToken")) {
    return children;
  } else {
    return <Navigate to={"/admin/login"} />;
  }
}
export default AdminRoutes;

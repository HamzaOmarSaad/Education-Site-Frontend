import { Login } from "../pages/auth/Login/Login";
import { createBrowserRouter } from "react-router";
import { Home } from "../pages/Home/Home";
import { Layout } from "../components/Layout/Layout";
import Signup from "../pages/auth/Signup/Signup";
import StudentDashboard from "../pages/StudDashboard/StudentDashboard";
import ConfirmOTP from "../pages/auth/OTP/ConfirmOTP";
import ProtectedRoutes from "./ProtectedRoutes";
import AuthRoutes from "./AuthRoutes ";

const routing = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/student-dashboard",
        element: (
          <ProtectedRoutes>
            <StudentDashboard />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/login",
        element: (
          <AuthRoutes>
            <Login />
          </AuthRoutes>
        ),
      },
      {
        path: "/signup",
        element: (
          <AuthRoutes>
            <Signup />
          </AuthRoutes>
        ),
      },
    ],
  },
  {
    path: "/confirm-email",
    element: <ConfirmOTP />,
  },
]);

export default routing;

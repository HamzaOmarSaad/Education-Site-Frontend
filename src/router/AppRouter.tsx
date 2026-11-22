import { Login } from "../pages/auth/Login/Login";
import { createBrowserRouter } from "react-router";
import Home from "../pages/Home/Home";
import { Layout } from "../components/Layout/Layout";
import Signup from "../pages/auth/Signup/Signup";
import StudentDashboard from "../pages/StudDashboard/StudentDashboard";
import ConfirmOTP from "../pages/auth/OTP/ConfirmOTP";
import ProtectedRoutes from "./ProtectedRoutes";
import AuthRoutes from "./AuthRoutes ";
import AdminLogin from "../pages/Admin/AdminLogin/AdminLogin";
import CreateTeacher from "../pages/Admin/CreateTeacher/CreateTeacher";
import AdminDashboard from "../pages/Admin/AdminDashboard/AdminDashboard";
import AdminRoutes from "./AdminRoutes";
import Teachers from "../pages/Teachers/Teachers";
import Courses from "../pages/Course/Courses";
import AdminTeachers from "../pages/Admin/AdminTeachers/AdminTeachers";
import TeacherDashboard from "../pages/Teacher/TeacherDashboard/TeacherDashboard";
import CourseDetails from "../pages/CourseDetails/CourseDetails";
import QuizPage from "../pages/Quiz/QuizPage";
import Subjects from "../pages/Subjects/Subjects";
import TeacherLogin from "../pages/Teacher/TeacherLogin/TeacherLogin";
import TeacherWorkspace from "../pages/Teacher/TeacherWorkspace/TeacherWorkspace";
import TeacherProfile from "../pages/Teachers/TeacherProfile";

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
        path: "/student/dashboard",
        element: (
          <ProtectedRoutes>
            <StudentDashboard />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/courses",
        element: <Courses />,
      },
      {
        path: "/subjects",
        element: <Subjects />,
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
      {
        path: "/teachers",
        element: <Teachers />,
      },
      {
        path: "/courses/:courseId",
        element: <CourseDetails />,
      },
      {
        path: "/quiz/:quizId",
        element: (
          <ProtectedRoutes>
            <QuizPage />
          </ProtectedRoutes>
        ),
      },
    ],
  },
  {
    path: "/confirm-email",
    element: <ConfirmOTP />,
  },
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/admin/dashboard",
    element: (
      <AdminRoutes>
        <AdminDashboard />
      </AdminRoutes>
    ),
  },
  {
    path: "/admin/create-teacher",
    element: (
      <AdminRoutes>
        <CreateTeacher />
      </AdminRoutes>
    ),
  },
  {
    path: "/admin/teachers",
    element: (
      <AdminRoutes>
        <AdminTeachers />
      </AdminRoutes>
    ),
  },
  {
    path: "/teacher/dashboard",
    element: (
      <ProtectedRoutes>
        <TeacherDashboard />
      </ProtectedRoutes>
    ),
  },
  { path: "/teacher/login", element: <TeacherLogin /> },
  { path: "/teacher/workspace", element: <ProtectedRoutes><TeacherWorkspace /></ProtectedRoutes> },
  { path: "/teacher/workspace/quizzes", element: <ProtectedRoutes><TeacherWorkspace /></ProtectedRoutes> },
  { path: "/teacher/workspace/vouchers", element: <ProtectedRoutes><TeacherWorkspace /></ProtectedRoutes> },
  { path: "/teacher/:teacherId", element: <ProtectedRoutes><TeacherProfile /></ProtectedRoutes> },
]);

export default routing;

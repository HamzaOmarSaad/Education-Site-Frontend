import { Outlet } from "react-router";
import { NavbarComponent } from "../Navbar/Navbar";
import Footer from "../Footer/Footer";

export const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex min-h-screen flex-col">
        <NavbarComponent />
        <div className="min-h-screen flex-1">
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
};

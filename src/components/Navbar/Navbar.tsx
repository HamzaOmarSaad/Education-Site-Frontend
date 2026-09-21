import { Link, NavLink, useNavigate } from "react-router";
import logo from "../../assets/logo.png";
import avatar from "../../assets/e1.png";

import {
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarToggle,
} from "flowbite-react";
import { useContext, useEffect } from "react";
import { Login, LogoutCurve } from "iconsax-reactjs";
import { userContext } from "../../context/userContext/contextCreation";

export const NavbarComponent = () => {
  const { userData, getUserData } = useContext(userContext);
  const router = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getUserData(token);
    }
  }, []);

  async function logout() {
    console.log("logout");
    localStorage.clear();
    router("/login");
  }

  return (
    <Navbar fluid rounded className="text-gray-600 bg-white">
      <NavbarBrand as={Link} href="/">
        <img src={logo} className="mr-3 h-6 sm:h-9" alt="  Logo" />
      </NavbarBrand>
      <NavbarToggle />
      <NavbarCollapse className="flex w-full flex-1 items-center">
        {userData ? (
          <>
            {/* Center links */}
            <div className="mx-auto flex gap-4 items-center">
              <NavLink to={"/"}>home</NavLink>
              <NavLink to={"/my-teachers"}>my teachers</NavLink>
              <NavLink to={"/my-course"}>my courses</NavLink>
              <NavLink to={"/my-books"}>books</NavLink>
            </div>
            {/* Right side user info */}
            <div className="ml-auto flex items-center gap-2">
              <img src={avatar} alt="user" className="h-8 w-8 rounded-full" />
              <div>
                <span>Hello </span>
                <span>{userData.name.split(" ")[0]}</span>
              </div>
            </div>
            <button onClick={logout}>
              <LogoutCurve size="32" color="#434445" />{" "}
            </button>
          </>
        ) : (
          <>
            {/* Center links */}
            <div className="mx-auto flex gap-4">
              <NavLink to={"/"}> Home</NavLink>

              <NavLink to={"/"}> teachers</NavLink>
              <NavLink to={"/"}> courses</NavLink>
              <NavLink to={"/"}>About</NavLink>
            </div>
            {/* Right side user info */}
            <div className="ml-auto flex items-center gap-2 cursor-pointer">
              <NavLink to="/login" className="flex">
                <Login size="24" color="#434445" className="mr-2" />
                login
              </NavLink>
            </div>
          </>
        )}
      </NavbarCollapse>
    </Navbar>
  );
};

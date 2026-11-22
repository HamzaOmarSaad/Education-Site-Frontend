import { Link, NavLink, useNavigate } from "react-router";
import avatar from "../../assets/e1.png";
import { useContext, useEffect } from "react";
import { LogoutCurve } from "iconsax-reactjs";
import { userContext } from "../../context/userContext/contextCreation";
import { useLanguage } from "../../context/language/LanguageContext";

export const NavbarComponent = () => {
  const { userData, getUserData } = useContext(userContext);
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) void getUserData(token);
  }, [getUserData]);

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-[#edf3ed] text-[#24533e]" : "text-[#526158] hover:bg-[#f2f4ef] hover:text-[#183f2f]"}`;

  return (
    <header className="sticky top-0 z-30 border-b border-[#e4e8df] bg-[#fffefa]/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="Thanaweya Online home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#24533e] text-sm font-bold tracking-wide text-white">TH</span>
          <span className="hidden text-base font-bold tracking-tight text-[#26352e] sm:inline">Thanaweya <span className="font-medium text-[#748078]">Online</span></span>
        </Link>

        <nav className="order-3 flex w-full items-center justify-center gap-1 overflow-x-auto sm:order-none sm:w-auto sm:justify-start sm:gap-2" aria-label="Main navigation">
          <NavLink to={userData ? "/student/dashboard" : "/"} className={navClass}>{t(userData ? "Dashboard" : "Home")}</NavLink>
          <NavLink to="/subjects" className={navClass}>{t("Subjects")}</NavLink>
          <NavLink to="/teachers" className={navClass}>{t("Teachers")}</NavLink>
          <NavLink to="/courses" className={navClass}>{t("Courses")}</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {userData ? (
            <div className="flex items-center gap-2">
              <img src={avatar} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-[#edf3ed]" />
              <span className="hidden max-w-28 truncate text-sm font-semibold text-[#35473e] lg:inline">{userData.name.split(" ")[0]}</span>
              <button type="button" onClick={logout} className="rounded-lg p-2 text-[#526158] hover:bg-[#f2f4ef]" aria-label={t("Logout")} title={t("Logout")}><LogoutCurve size="20" color="currentColor" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <NavLink to="/login" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-[#526158] hover:bg-[#f2f4ef] sm:inline-flex">{t("Login")}</NavLink>
              <NavLink to="/signup" className="rounded-lg bg-[#24533e] px-3 py-2 text-sm font-semibold text-white hover:bg-[#183f2f]">{t("Sign up")}</NavLink>
              <NavLink to="/teacher/login" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[#748078] hover:text-[#24533e] md:inline-flex">{t("teacher portal")}</NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

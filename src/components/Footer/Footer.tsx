import { Link } from "react-router";
import { useLanguage } from "../../context/language/LanguageContext";

function Footer() {
  const { t } = useLanguage();
  return <footer className="mt-auto border-t border-[#e4e8df] bg-[#fffefa]">
    <div className="mx-auto grid max-w-7xl gap-9 px-6 py-10 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
      <div>
        <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#24533e] text-xs font-bold text-white">TH</span><span className="font-bold text-[#26352e]">Thanaweya Online</span></div>
        <p className="mt-4 max-w-sm text-sm leading-6 text-[#748078]">{t("A focused learning space for high school students, with clear lessons and thoughtful practice.")}</p>
      </div>
      <div><h3 className="font-semibold text-[#26352e]">{t("Explore")}</h3><div className="mt-4 flex flex-col gap-3 text-sm text-[#526158]"><Link to="/" className="hover:text-[#24533e]">{t("Home")}</Link><Link to="/subjects" className="hover:text-[#24533e]">{t("Subjects")}</Link><Link to="/courses" className="hover:text-[#24533e]">{t("Courses")}</Link><Link to="/teachers" className="hover:text-[#24533e]">{t("Teachers")}</Link></div></div>
      <div><h3 className="font-semibold text-[#26352e]">{t("Your account")}</h3><div className="mt-4 flex flex-col gap-3 text-sm text-[#526158]"><Link to="/login" className="hover:text-[#24533e]">{t("Login")}</Link><Link to="/signup" className="hover:text-[#24533e]">{t("Create Account")}</Link><Link to="/teacher/login" className="hover:text-[#24533e]">{t("Teacher login")}</Link></div></div>
    </div>
    <div className="border-t border-[#e4e8df] px-6 py-4 text-center text-xs text-[#748078]">© 2026 Thanaweya Online · {t("Learning, made clear.")}</div>
  </footer>;
}

export default Footer;

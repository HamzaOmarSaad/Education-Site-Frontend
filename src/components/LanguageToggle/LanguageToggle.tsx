import { useLanguage } from "../../context/language/LanguageContext";

export default function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage();
  return <button type="button" onClick={() => setLanguage(language === "en" ? "ar" : "en")} className={`rounded-lg border border-[#d9e0d7] px-3 py-2 text-xs font-bold text-[#24533e] hover:bg-[#edf3ed] ${compact ? "" : "shadow-sm"}`} aria-label="Change language">
    {language === "en" ? "العربية" : "English"}
  </button>;
}

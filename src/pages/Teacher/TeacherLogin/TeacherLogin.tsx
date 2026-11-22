import { useState } from "react";
import { Alert, Button, Card, Label, Spinner, TextInput } from "flowbite-react";
import { Link, useNavigate } from "react-router";
import { api } from "../../../api/client";
import axios from "axios";
import { useLanguage } from "../../../context/language/LanguageContext";

export default function TeacherLogin() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/login/teacher", { email, password });
      const token = response.data?.data?.accessToken;
      if (!token) throw new Error("No access token was returned.");
      localStorage.setItem("token", token);
      const userId = response.data?.data?.user?.id;
      if (userId) localStorage.setItem("teacherId", userId);
      localStorage.removeItem("adminToken");
      navigate("/teacher/dashboard");
    } catch (cause) {
      setError(axios.isAxiosError(cause) ? cause.response?.data?.message ?? "Unable to sign in as a teacher." : "Unable to sign in as a teacher.");
    } finally { setLoading(false); }
  };

  return <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4"><Card className="w-full max-w-md">
    <h1 className="text-3xl font-bold text-gray-900">{t("Teacher login")}</h1>
    <p className="text-gray-500">{t("Sign in to manage your students.")}</p>
    {error && <Alert color="failure">{error}</Alert>}
    <form onSubmit={submit} className="space-y-5">
      <div><Label htmlFor="teacher-email">{t("Email")}</Label><TextInput id="teacher-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
      <div><Label htmlFor="teacher-password">{t("Password")}</Label><TextInput id="teacher-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
      <Button type="submit" className="w-full" disabled={loading}>{loading ? <Spinner size="sm" /> : t("Sign in")}</Button>
    </form>
    <Link className="text-center text-sm text-blue-600 hover:underline" to="/login">{t("Student login")}</Link>
  </Card></main>;
}

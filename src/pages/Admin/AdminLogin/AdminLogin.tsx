import { useState } from "react";
import { Button, Card, Label, TextInput, Alert, Spinner } from "flowbite-react";
import { useNavigate } from "react-router";
import axios from "axios";
import { api } from "../../../api/client";
import { useLanguage } from "../../../context/language/LanguageContext";

function AdminLogin() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const { data } = await api.post(
        "/auth/login/admin",
        {
          email,
          password,
        },
      );

      if (data?.data?.accessToken) {
        localStorage.setItem("adminToken", data?.data?.accessToken);
        localStorage.removeItem("token");
      }

      navigate("/admin/dashboard");
    } catch (err: unknown) {
      let message = "Invalid email or password";

      if (axios.isAxiosError(err)) {
        message = err.response?.data?.data?.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-600 text-2xl font-bold text-white">
            A
          </div>

          <h1 className="text-3xl font-bold text-gray-900">{t("Admin Login")}</h1>

          <p className="mt-2 text-gray-500">
            {t("Sign in to manage your education platform")}
          </p>
        </div>

        {error && (
          <Alert color="failure" className="mb-5">
            {error}
          </Alert>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <Label htmlFor="email">{t("Admin Email")}</Label>

            <TextInput
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">{t("Password")}</Label>

            <TextInput
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            color="cyan"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Signing in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </Card>
    </main>
  );
}

export default AdminLogin;

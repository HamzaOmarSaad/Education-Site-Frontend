import { Button, Label, TextInput } from "flowbite-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
import { loginSchema } from "../auth.validation";
import type { z } from "zod";
import { useContext } from "react";
import { userContext } from "../../../context/userContext/contextCreation";
import { api } from "../../../api/client";
import { useLanguage } from "../../../context/language/LanguageContext";

type LoginFormData = z.infer<typeof loginSchema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-red-600 text-sm mt-1">{message}</p>;
}

export function Login() {
  const { getUserData } = useContext(userContext);
  const router = useNavigate();
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    try {
      const res = await api("/auth/login", {
        method: "POST",
        data,
      });

      console.log("🚀 ~ onSubmit ~ response.data?.token:", res.data.data);
      if (res.data.data?.accessToken) {
        localStorage.setItem("token", res.data.data.accessToken);
        await getUserData(res.data.data.accessToken);
      }

      toast.success("Login successful");
      router("/student/dashboard");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.data?.error ?? "Login failed");
      } else {
        toast.error("Login failed");
      }
    }
  }

  return (
    <div className="flex flex-col lg:flex-row lg:justify-center lg:items-center gap-10 px-4 py-8 lg:py-12 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
      {/* Hero */}
      <div className="flex flex-col gap-4 lg:max-w-md text-center lg:text-left">
        <p className="text-sm uppercase tracking-widest text-blue-600 font-semibold">
          {t("Largest education site")}
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
          {t("Welcome ")}<span className="text-blue-600">{t("Back")}</span>
        </h1>
        <p className="text-gray-600 text-lg">
          {t("Log in to continue your educational journey with the best teachers in Egypt.")}
        </p>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 w-full max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t("Log In")}</h2>
        <p className="text-gray-500 text-sm mb-6">
          {t("Enter your credentials to access your account")}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div>
            <Label htmlFor="email">
              {t("Your Email")} <span className="text-red-500">*</span>
            </Label>
            <TextInput
              id="email"
              type="email"
              placeholder="you@example.com"
              className="mt-1"
              color={errors.email ? "failure" : undefined}
              {...register("email")}
            />
            <FieldError message={errors.email?.message} />
          </div>

          <div>
            <Label htmlFor="password">
              {t("Your Password")} <span className="text-red-500">*</span>
            </Label>
            <TextInput
              id="password"
              type="password"
              placeholder="••••••••"
              className="mt-1"
              color={errors.password ? "failure" : undefined}
              {...register("password")}
            />
            <FieldError message={errors.password?.message} />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? t("Logging in...") : t("Log In")}
          </Button>

          <p className="text-center text-sm text-gray-600">
            {t("Don't have an account?")}
            <Link
              to="/signup"
              className="text-blue-600 hover:underline font-medium"
            >
              {t("Sign up")}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;

import { useContext, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Spinner } from "flowbite-react";
import { useNavigate } from "react-router";
import axios from "axios";

import { otpSchema, type OtpFormValues } from "../auth.validation";
import { verifyContext } from "../../../context/verify Context/contextCreation";
import { handleApiError } from "../../../utils/common/errorHandler";
import { api } from "../../../api/client";
import { useLanguage } from "../../../context/language/LanguageContext";
import { Sms } from "iconsax-reactjs";


export default function ConfirmOTP() {
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const { userEmail } = useContext(verifyContext);
  const { t } = useLanguage();

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    setError,
    clearErrors,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: ["", "", "", "", "", ""],
    },
  });

  const handleOtpChange = (
    value: string,
    index: number,
    onChange: (value: string) => void,
  ) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    onChange(digit);

    clearErrors("otp");
    clearErrors("root");

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (event.key !== "Backspace") return;

    const currentValue = getValues(`otp.${index}`);

    if (!currentValue && index > 0) {
      event.preventDefault();

      setValue(`otp.${index - 1}`, "", {
        shouldDirty: true,
        shouldValidate: true,
      });

      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const pastedOtp = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedOtp) return;

    pastedOtp.split("").forEach((digit, index) => {
      setValue(`otp.${index}`, digit, {
        shouldDirty: true,
        shouldValidate: true,
      });
    });

    clearErrors("otp");
    clearErrors("root");

    void trigger("otp");

    const focusIndex = Math.min(pastedOtp.length, 5);

    inputRefs.current[focusIndex]?.focus();
  };

  const onSubmit = async (data: OtpFormValues) => {
    try {
      clearErrors("root");
      setResendSuccess(false);

      if (!userEmail) {
        console.log(userEmail);

        setError("root", {
          message:
            "Email address is missing. Please go back and register again.",
        });

        return;
      }

      const otp = data.otp.join("");

      const response = await api.post(
        "/auth/confirm-email",
        {
          email: userEmail,
          otp,
        },
        {
          withCredentials: true,
        },
      );

      const apiSuccess = response.data?.success ?? response.data?.data?.success;
      const apiMessage = response.data?.message ?? response.data?.data?.message;

      if (!apiSuccess) {
        setError("root", {
          message: apiMessage || "Invalid or expired verification code.",
        });

        return;
      }
      navigate("/login");
    } catch (error) {
      handleApiError(error);
      console.error("Confirm OTP error:", error);

      if (axios.isAxiosError(error)) {
        setError("root", {
          message:
            error.response?.data.data?.message ||
            "Invalid or expired verification code.",
        });

        return;
      }

      setError("root", {
        message: "Something went wrong. Please try again later.",
      });
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      setResendSuccess(false);

      clearErrors("root");

      if (!userEmail) {
        setError("root", {
          message:
            "Email address is missing. Please go back and register again.",
        });

        return;
      }

      const response = await api.post(
        "/auth/resend-email",
        {
          email: userEmail,
        },
        {
          withCredentials: true,
        },
      );

      const apiSuccess = response.data?.success ?? response.data?.data?.success;
      if (!apiSuccess) {
        setError("root", {
          message:
            response.data?.message ||
            response.data?.data?.message ||
            "Failed to resend verification code.",
        });

        return;
      }

      for (let index = 0; index < 6; index++) {
        setValue(`otp.${index}`, "", {
          shouldDirty: false,
          shouldValidate: false,
        });
      }

      clearErrors();

      setResendSuccess(true);

      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error("Resend OTP error:", error);

      if (axios.isAxiosError(error)) {
        setError("root", {
          message:
            error.response?.data?.message ||
            "Failed to resend verification code.",
        });

        return;
      }

      setError("root", {
        message: "Something went wrong while resending the code.",
      });
    } finally {
      setResending(false);
    }
  };

  const errorMessage = errors.root?.message || errors.otp?.message;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl">
            <Sms size="25" color="currentColor" />
          </div>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("Verify your email")}
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            {t("We sent a 6-digit verification code to")}
          </p>

          {userEmail && (
            <p className="mt-1 text-sm font-semibold text-gray-700">
              {userEmail}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6 flex justify-center gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Controller
                key={index}
                name={`otp.${index}`}
                control={control}
                render={({ field }) => (
                  <input
                    ref={(element) => {
                      field.ref(element);
                      inputRefs.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={field.value}
                    onChange={(event) =>
                      handleOtpChange(event.target.value, index, field.onChange)
                    }
                    onKeyDown={(event) => handleKeyDown(event, index)}
                    onPaste={handlePaste}
                    onBlur={field.onBlur}
                    aria-label={`OTP digit ${index + 1}`}
                    className={`
                      h-12 w-11 rounded-lg border bg-gray-50
                      text-center text-xl font-semibold
                      text-gray-900 outline-none transition
                      sm:h-14 sm:w-12
                      ${
                        errorMessage
                          ? "border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      }
                    `}
                  />
                )}
              />
            ))}
          </div>

          {errorMessage && (
            <Alert color="failure" className="mb-5">
              {errorMessage}
            </Alert>
          )}

          {resendSuccess && (
            <Alert color="success" className="mb-5">
              {t("A new verification code has been sent to your email.")}
            </Alert>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                Verifying...
              </span>
            ) : (
              t("Verify email")
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">{t("Didn't receive the code?")}</p>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="
              mt-2 text-sm font-semibold text-blue-600
              hover:text-blue-700 hover:underline
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {resending ? t("Sending...") : t("Resend code")}
          </button>
        </div>
      </section>
    </main>
  );
}

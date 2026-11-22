import { Button, Label, Select, TextInput } from "flowbite-react";
import { useForm, useWatch } from "react-hook-form";
import { signupSchema, type SignUpFormData } from "../auth.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GenderEnum,
  GradeEnum,
  TrackYear,
} from "../../../utils/enums/user.enums";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { verifyContext } from "../../../context/verify Context/contextCreation";
import { useContext } from "react";
import { getApiErrorInfo, handleApiError } from "../../../utils/common/errorHandler";
import { api } from "../../../api/client";
import { useLanguage } from "../../../context/language/LanguageContext";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-red-600 text-sm mt-1">{message}</p>;
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-1">
      {title}
    </h2>
  );
}
const defaultValues = {
  name: "",
  email: "",
  password: "",
  rePassword: "",
  gender: undefined,
  phone: "",
  parentPhone: "",
  school: "",
  grade: undefined,
  track: undefined,
};
export function Signup() {
  const { setUserEmail } = useContext(verifyContext);
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: defaultValues,
  });

  const selectedGrade = useWatch({ control, name: "grade" });

  const router = useNavigate();

  async function onSubmit(data: SignUpFormData) {
    try {
      console.log(data);

      const response = await api("/auth/signup", {
        method: "POST",
        data,
      });
      console.log("🚀 ~ onSubmit ~ response:", response);

      setUserEmail(data.email);
      toast.success("Account created. Check your email for the code.");
      router("/confirm-email");
    } catch (error) {
      const info = getApiErrorInfo(error);
      for (const issue of info.fieldErrors) {
        if (issue.field in defaultValues) {
          setError(issue.field as keyof SignUpFormData, { type: "server", message: issue.message });
        }
      }
      handleApiError(error);
    }
  }
  return (
    <main className="min-h-screen bg-gray-50 py-8 lg:py-16">
      <div className="mx-auto grid max-w-7xl items-start gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Left Side */}
        <section className="flex flex-col justify-center lg:sticky lg:top-10 lg:min-h-150">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
              {t("Start Your Learning Journey")}
            </div>

            <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
              {t("Learn smarter.")}
              <span className="block text-blue-600">{t("Achieve more.")}</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-gray-600 sm:text-lg">
              Create your account and join thousands of students learning with
              the best teachers in Egypt.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-2xl font-bold text-gray-900">100+</p>
                <p className="mt-1 text-sm text-gray-500">{t("Teachers")}</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-2xl font-bold text-gray-900">10K+</p>
                <p className="mt-1 text-sm text-gray-500">{t("Students")}</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-2xl font-bold text-gray-900">24/7</p>
                <p className="mt-1 text-sm text-gray-500">{t("Learning")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side - Form */}
        <section className="w-full">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xl shadow-gray-200/60 sm:p-8 lg:p-10">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {t("Create your account")}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {t("Fill in your information to get started.")}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 ">
              {/* Account */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    1
                  </div>

                  <SectionTitle title={t("Account Details")} />
                </div>

                <div className="space-y-4">
                  {/* Keep your existing name field here */}

                  <div>
                    <Label className="dark:text-black" htmlFor="username">
                      {t("Your Name")} <span className="text-red-500">*</span>
                    </Label>

                    <TextInput
                      id="username"
                      type="text"
                      placeholder=" your name "
                      className="mt-1  "
                      color={errors.name ? "failure" : undefined}
                      {...register("name")}
                    />

                    <FieldError message={errors.name?.message} />
                  </div>

                  <div>
                    <Label className="dark:text-black" htmlFor="email1">
                      {t("Your Email")} <span className="text-red-500">*</span>
                    </Label>

                    <TextInput
                      id="email1"
                      type="email"
                      placeholder="you@example.com"
                      className="mt-1 text-white"
                      color={errors.email ? "failure" : undefined}
                      {...register("email")}
                    />

                    <FieldError message={errors.email?.message} />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="dark:text-black" htmlFor="password1">
                        {t("Password")} <span className="text-red-500">*</span>
                      </Label>

                      <TextInput
                        id="password1"
                        type="password"
                        placeholder="••••••••"
                        className="mt-1"
                        color={errors.password ? "failure" : undefined}
                        {...register("password")}
                      />

                      <FieldError message={errors.password?.message} />
                    </div>

                    <div>
                      <Label className="dark:text-black" htmlFor="password2 ">
                        {t("Confirm Password")} <span className="text-red-500">*</span>
                      </Label>

                      <TextInput
                        id="password2"
                        type="password"
                        placeholder="••••••••"
                        className="mt-1"
                        color={errors.rePassword ? "failure" : undefined}
                        {...register("rePassword")}
                      />

                      <FieldError message={errors.rePassword?.message} />
                    </div>
                  </div>
                </div>
              </section>

              {/* Keep your Personal Information section */}
              {/* Keep your Education Details section */}
              <section className="space-y-4">
                <SectionTitle title={t("Personal Information")} />

                <div>
                  <Label className=" dark:text-black">
                    {t("Gender")} <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-6 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                      <input
                        type="radio"
                        value={GenderEnum.MALE}
                        className="text-blue-600 focus:ring-blue-500"
                        {...register("gender")}
                      />
                      Male
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-black">
                      <input
                        type="radio"
                        value={GenderEnum.FEMALE}
                        className="text-blue-600 focus:ring-blue-500"
                        {...register("gender")}
                      />
                      Female
                    </label>
                  </div>
                  <FieldError message={errors.gender?.message} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="dark:text-black" htmlFor="phone">
                      {t("Your Phone")} <span className="text-red-500">*</span>
                    </Label>
                    <TextInput
                      id="phone"
                      type="text"
                      placeholder="01xxxxxxxxx"
                      className="mt-1"
                      color={errors.phone ? "failure" : undefined}
                      {...register("phone")}
                    />
                    <FieldError message={errors.phone?.message} />
                  </div>
                  <div>
                    <Label className="dark:text-black" htmlFor="parentPhone">
                      {t("Parent Phone")} <span className="text-red-500">*</span>
                    </Label>
                    <TextInput
                      id="parentPhone"
                      type="text"
                      placeholder="01xxxxxxxxx"
                      className="mt-1"
                      color={errors.parentPhone ? "failure" : undefined}
                      {...register("parentPhone")}
                    />
                    <FieldError message={errors.parentPhone?.message} />
                  </div>
                </div>
              </section>

              {/* Education */}
              <section className="space-y-4">
                <SectionTitle title={t("Education Details")} />

                <div>
                  <Label className="dark:text-black" htmlFor="school">
                    {t("Your School")} <span className="text-red-500">*</span>
                  </Label>
                  <TextInput
                    id="school"
                    type="text"
                    placeholder="School name"
                    className="mt-1"
                    color={errors.school ? "failure" : undefined}
                    {...register("school")}
                  />
                  <FieldError message={errors.school?.message} />
                </div>

                <div>
                  <Label className="dark:text-black" htmlFor="grade">
                    {t("Grade")} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    id="grade"
                    className="mt-1"
                    color={errors.grade ? "failure" : undefined}
                    {...register("grade")}
                  >
                    <option value="">{t("Select grade")}</option>
                    <option value={GradeEnum.FIRST_SECONDARY}>
                      {t("First Secondary")}
                    </option>
                    <option value={GradeEnum.SECOND_SECONDARY}>
                      {t("Second Secondary")}
                    </option>
                    <option value={GradeEnum.THIRD_SECONDARY}>
                      {t("Third Secondary")}
                    </option>
                  </Select>
                  <FieldError message={errors.grade?.message} />
                </div>

                <div>
                  <Label className="dark:text-black" htmlFor="tracks">
                    {t("Track")} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    id="tracks"
                    className="mt-1"
                    color={errors.track ? "failure" : undefined}
                    {...register("track")}
                  >
                    <option value="">{t("Select track")}</option>

                    {selectedGrade === GradeEnum.FIRST_SECONDARY && (
                      <option value={TrackYear.GENERAL}>{t("General")}</option>
                    )}

                    {selectedGrade === GradeEnum.SECOND_SECONDARY && (
                      <>
                        <option value={TrackYear.LITERARY}>{t("Literary")}</option>
                        <option value={TrackYear.SCIENTIFIC}>{t("Scientific")}</option>
                      </>
                    )}

                    {selectedGrade === GradeEnum.THIRD_SECONDARY && (
                      <>
                        <option value={TrackYear.SCIENTIFIC_MATH}>
                          {t("Scientific Mathematics")}
                        </option>
                        <option value={TrackYear.SCIENTIFIC_SCIENCE}>
                          {t("Scientific Science")}
                        </option>
                        <option value={TrackYear.LITERARY}>{t("Literary")}</option>
                      </>
                    )}
                  </Select>
                  <FieldError message={errors.track?.message} />
                </div>
              </section>

              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="w-full rounded-xl py-3 text-base font-semibold"
              >
                {isSubmitting ? t("Creating account...") : t("Create Account")}
              </Button>

              <p className="text-center text-sm text-gray-600">
                {t("Already have an account?")}{" "}
                <Link
                  to="/login"
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  {t("Log In")}
                </Link>
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Signup;

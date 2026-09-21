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
import axios from "axios";
import toast from "react-hot-toast";
import { verifyContext } from "../../../context/verify Context/contextCreation";
import { useContext } from "react";

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

  const {
    register,
    handleSubmit,
    control,
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

      const response = await axios("http://localhost:3000/auth/signup", {
        method: "POST",
        data,
      });
      console.log("🚀 ~ onSubmit ~ response:", response);

      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
      }

      setUserEmail(data.email);
      toast.success("Login successful");
      router("/confirm-email");
    } catch (error) {
      console.log("🚀 ~ onSubmit ~ error:", error);
    }
  }
  return (
    <main className="min-h-screen bg-gray-50 py-8 lg:py-16">
      <div className="mx-auto grid max-w-7xl items-start gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Left Side */}
        <section className="flex flex-col justify-center lg:sticky lg:top-10 lg:min-h-150">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
              🎓 Start Your Learning Journey
            </div>

            <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Learn smarter.
              <span className="block text-blue-600">Achieve more.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-gray-600 sm:text-lg">
              Create your account and join thousands of students learning with
              the best teachers in Egypt.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-2xl font-bold text-gray-900">100+</p>
                <p className="mt-1 text-sm text-gray-500">Teachers</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-2xl font-bold text-gray-900">10K+</p>
                <p className="mt-1 text-sm text-gray-500">Students</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-2xl font-bold text-gray-900">24/7</p>
                <p className="mt-1 text-sm text-gray-500">Learning</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side - Form */}
        <section className="w-full">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xl shadow-gray-200/60 sm:p-8 lg:p-10">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Create your account
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Fill in your information to get started.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 ">
              {/* Account */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    1
                  </div>

                  <SectionTitle title="Account Details" />
                </div>

                <div className="space-y-4">
                  {/* Keep your existing name field here */}

                  <div>
                    <Label className="dark:text-black" htmlFor="username">
                      Your Name <span className="text-red-500">*</span>
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
                      Your Email <span className="text-red-500">*</span>
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
                        Password <span className="text-red-500">*</span>
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
                        Confirm Password <span className="text-red-500">*</span>
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
                <SectionTitle title="Personal Information" />

                <div>
                  <Label className=" dark:text-black">
                    Gender <span className="text-red-500">*</span>
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
                      Your Phone <span className="text-red-500">*</span>
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
                      Parent Phone <span className="text-red-500">*</span>
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
                <SectionTitle title="Education Details" />

                <div>
                  <Label className="dark:text-black" htmlFor="school">
                    Your School <span className="text-red-500">*</span>
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
                    Grade <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    id="grade"
                    className="mt-1"
                    color={errors.grade ? "failure" : undefined}
                    {...register("grade")}
                  >
                    <option value="">Select grade</option>
                    <option value={GradeEnum.FIRST_SECONDARY}>
                      First Secondary
                    </option>
                    <option value={GradeEnum.SECOND_SECONDARY}>
                      Second Secondary
                    </option>
                    <option value={GradeEnum.THIRD_SECONDARY}>
                      Third Secondary
                    </option>
                  </Select>
                  <FieldError message={errors.grade?.message} />
                </div>

                <div>
                  <Label className="dark:text-black" htmlFor="tracks">
                    Track <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    id="tracks"
                    className="mt-1"
                    color={errors.track ? "failure" : undefined}
                    {...register("track")}
                  >
                    <option value="">Select track</option>

                    {selectedGrade === GradeEnum.FIRST_SECONDARY && (
                      <option value={TrackYear.GENERAL}>General</option>
                    )}

                    {selectedGrade === GradeEnum.SECOND_SECONDARY && (
                      <>
                        <option value={TrackYear.LITERARY}>Literary</option>
                        <option value={TrackYear.SCIENTIFIC}>Scientific</option>
                      </>
                    )}

                    {selectedGrade === GradeEnum.THIRD_SECONDARY && (
                      <>
                        <option value={TrackYear.SCIENTIFIC_MATH}>
                          Scientific Mathematics
                        </option>
                        <option value={TrackYear.SCIENTIFIC_SCIENCE}>
                          Scientific Science
                        </option>
                        <option value={TrackYear.LITERARY}>Literary</option>
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
                {isSubmitting ? "Creating account..." : "Create Account"}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Log in
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

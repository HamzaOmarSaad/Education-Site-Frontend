import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  FileInput,
  Label,
  Spinner,
  Textarea,
  TextInput,
} from "flowbite-react";
import { api } from "../../../api/client";
import { useNavigate } from "react-router";
import { getApiErrorInfo, handleApiError } from "../../../utils/common/errorHandler";
import { useLanguage } from "../../../context/language/LanguageContext";

type SubjectOption = { id: string; name: string; description?: string; track?: { name: string; academicYear?: { grade?: { name: string } } } };

const initialFormData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  subjectId: "",
  gender: "",
  bio: "",
  specialization: "",
  experience: "",
  qualifications: "",
};

function CreateTeacher() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([]);
  const [subjectLoadError, setSubjectLoadError] = useState(false);

  const [image, setImage] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const fieldError = (name: string) => fieldErrors[name];

  useEffect(() => {
    api.get("/course/subjects")
      .then(({ data }) => setSubjectOptions(Array.isArray(data?.data) ? data.data : []))
      .catch(() => { setSubjectOptions([]); setSubjectLoadError(true); });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFieldErrors((current) => { const next = { ...current }; delete next[name]; if (name === "confirmPassword") delete next.rePassword; return next; });

    if (name === "subjectId") {
      const selectedSubject = subjectOptions.find((item) => item.id === value);

      setFormData((prev) => ({
        ...prev,
        subjectId: value,
        subject: selectedSubject?.name || "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setFieldErrors({});

    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: t("Passwords do not match.") });
      return;
    }

    setLoading(true);

    try {
      const body = new FormData();

      body.append("name", formData.name);
      body.append("email", formData.email);
      body.append("password", formData.password);
      body.append("rePassword", formData.confirmPassword);
      body.append("phone", formData.phone);
      body.append("subjectId", formData.subjectId);
      body.append("gender", formData.gender);
      if (formData.bio.trim()) body.append("bio", formData.bio.trim());
      if (formData.specialization.trim()) body.append("specialization", formData.specialization.trim());
      if (formData.experience) body.append("experience", formData.experience);
      if (formData.qualifications.trim()) body.append("qualifications", formData.qualifications.trim());

      if (image) {
        body.append("attachment", image);
      }

      // Let the browser set Content-Type so it includes the multipart boundary.
      await api.post("/admin/create-teacher", body);

      setSuccess("Teacher created successfully.");
      setFormData(initialFormData);
      setImage(null);
    } catch (error: unknown) {
      handleApiError(error);
      const info = getApiErrorInfo(error);
      const mapped = Object.fromEntries(info.fieldErrors.map((issue) => [issue.field === "rePassword" ? "confirmPassword" : issue.field, issue.message]));
      setFieldErrors(mapped);
      setError(info.fieldErrors.length ? "" : info.message || t("Failed to create teacher."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="mb-4 text-sm font-medium text-cyan-600 hover:underline"
          >
            ← {t("Back to dashboard")}
          </button>

          <h1 className="text-3xl font-bold text-gray-900">{t("Create Teacher")}</h1>

          <p className="mt-2 text-gray-500">
            {t("Add a new teacher to your education platform.")}
          </p>
        </div>

        <Card>
          {success && (
            <Alert color="success" className="mb-6">
              {success}
            </Alert>
          )}

          {error && (
            <Alert color="failure" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <Label htmlFor="name">{t("Teacher Name")}</Label>

              <TextInput
                id="name"
                name="name"
                placeholder="Ahmed Mohamed"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <InputError message={fieldError("name")} />
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <Label htmlFor="email">{t("Email")}</Label>

                <TextInput
                  id="email"
                  name="email"
                  type="email"
                  placeholder="teacher@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <InputError message={fieldError("email")} />
              </div>

              <div>
                <Label htmlFor="phone">{t("Phone")}</Label>

                <TextInput
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="01000000000"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                <InputError message={fieldError("phone")} />
                <p className="mt-1 text-xs text-gray-500">{t("Enter an Egyptian mobile number, such as 01012345678.")}</p>
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <Label htmlFor="password">{t("Password")}</Label>

                <TextInput
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <InputError message={fieldError("password")} />
                <p className="mt-1 text-xs text-gray-500">{t("Use 8–20 characters with uppercase, lowercase, a number, and a symbol.")}</p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">{t("Confirm Password")}</Label>

                <TextInput
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <InputError message={fieldError("confirmPassword")} />
              </div>
            </div>

            {/* Subject */}
            <div>
              <Label htmlFor="subjectId">{t("Subject")}</Label>

              <select
                id="subjectId"
                name="subjectId"
                value={formData.subjectId}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-cyan-500 focus:ring-cyan-500"
                required
              >
                <option value="">{t("Select a subject")}</option>
                {subjectOptions.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.track?.academicYear?.grade?.name} · {subject.track?.name} · {subject.name}
                  </option>
                ))}
              </select>
              <InputError message={fieldError("subjectId")} />
              {subjectLoadError && <p className="mt-2 text-sm text-red-700">{t("Could not load subjects. Check the API connection and try again.")}</p>}
              {formData.subjectId && <p className="mt-2 text-sm text-gray-600">{t("Subject ID sent to the server")}: <code className="rounded bg-gray-100 px-1.5 py-0.5">{formData.subjectId}</code></p>}
            </div>

            {/* Gender + Experience */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <Label htmlFor="gender">{t("Gender")}</Label>

                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-cyan-500 focus:ring-cyan-500"
                  required
                >
                  <option value="">{t("Select gender")}</option>
                  <option value="MALE">{t("Male")}</option>
                  <option value="FEMALE">{t("Female")}</option>
                </select>
                <InputError message={fieldError("gender")} />
              </div>

              <div>
                <Label htmlFor="experience">{t("Experience (Years)")}</Label>

                <TextInput
                  id="experience"
                  name="experience"
                  type="number"
                  min="0"
                  placeholder="5"
                  value={formData.experience}
                  onChange={handleChange}
                />
                <InputError message={fieldError("experience")} />
              </div>
            </div>

            {/* Specialization */}
            <div>
              <Label htmlFor="specialization">{t("Specialization")}</Label>

              <TextInput
                id="specialization"
                name="specialization"
                placeholder="Mathematics / Web Development"
                value={formData.specialization}
                onChange={handleChange}
              />
              <InputError message={fieldError("specialization")} />
            </div>

            {/* Qualifications */}
            <div>
              <Label htmlFor="qualifications">{t("Qualifications")}</Label>

              <Textarea
                id="qualifications"
                name="qualifications"
                placeholder="List the teacher's degrees, certifications, and expertise..."
                rows={4}
                value={formData.qualifications}
                onChange={handleChange}
              />
              <InputError message={fieldError("qualifications")} />
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio">{t("Teacher Bio")}</Label>

              <Textarea
                id="bio"
                name="bio"
                placeholder="Write a short description about the teacher..."
                rows={5}
                value={formData.bio}
                onChange={handleChange}
              />
              <InputError message={fieldError("bio")} />
            </div>

            {/* Image */}
            <div>
              <Label htmlFor="image">{t("Profile Image")}</Label>

              <FileInput
                id="image"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const selected = e.target.files?.[0] || null;
                  if (selected && selected.size > 5 * 1024 * 1024) {
                    setError(t("Image must be 5 MB or smaller."));
                    setImage(null);
                    e.target.value = "";
                    return;
                  }
                  setError("");
                  setImage(selected);
                }}
              />

              <p className="mt-2 text-sm text-gray-500">{t("PNG, JPEG, or WEBP image. Maximum 5 MB.")}</p>
              <InputError message={fieldError("file")} />
              {image && <p className="mt-1 text-sm text-gray-600">{t("Selected image")}: {image.name}</p>}
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <Button type="submit" color="cyan" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    {t("Creating Teacher...")}
                  </>
                ) : (
                  t("Create Teacher")
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}

function InputError({ message }: { message?: string }) {
  return message ? <p role="alert" className="mt-1 text-sm text-red-700">{message}</p> : null;
}

export default CreateTeacher;

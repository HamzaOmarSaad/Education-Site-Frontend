import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Card, Label, Spinner, TextInput } from "flowbite-react";
import { useNavigate } from "react-router";
import { api, responseData } from "../../../api/client";
import { useLanguage } from "../../../context/language/LanguageContext";
import { getApiErrorInfo } from "../../../utils/common/errorHandler";

type TeacherRecord = {
  id: string;
  bio?: string | null;
  specialization?: string | null;
  experience?: number | null;
  qualifications?: string | null;
  subject?: { name?: string } | null;
  user: { id: string; name: string; email: string; profilePicture?: string | null };
};
type TeacherDraft = { name: string; email: string; bio: string; specialization: string; experience: string; qualifications: string };
const emptyDraft: TeacherDraft = { name: "", email: "", bio: "", specialization: "", experience: "", qualifications: "" };

function AdminTeachers() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [draft, setDraft] = useState<TeacherDraft>(emptyDraft);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/admin/teachers");
      setTeachers(responseData<TeacherRecord[]>(response));
    } catch {
      setError(t("Could not load teachers."));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) {
      navigate("/admin/login");
      return;
    }
    void fetchTeachers();
  }, [fetchTeachers, navigate]);

  const beginEdit = (teacher: TeacherRecord) => {
    setNotice("");
    setError("");
    setEditingId(teacher.id);
    setDraft({
      name: teacher.user.name,
      email: teacher.user.email,
      bio: teacher.bio ?? "",
      specialization: teacher.specialization ?? "",
      experience: teacher.experience?.toString() ?? "",
      qualifications: teacher.qualifications ?? "",
    });
  };

  const saveEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusyId(editingId);
    setError("");
    setFieldErrors({});
    try {
      await api.patch(`/admin/teachers/${editingId}`, {
        name: draft.name.trim(),
        email: draft.email.trim(),
        bio: draft.bio.trim(),
        specialization: draft.specialization.trim(),
        experience: draft.experience ? Number(draft.experience) : undefined,
        qualifications: draft.qualifications.trim(),
      });
      setEditingId("");
      setNotice(t("Teacher details updated."));
      await fetchTeachers();
    } catch (cause) {
      const info = getApiErrorInfo(cause);
      setFieldErrors(Object.fromEntries(info.fieldErrors.map((issue) => [issue.field, issue.message])));
      setError(info.fieldErrors.length ? info.message : t("Could not update teacher. Check the details and try again."));
    } finally {
      setBusyId("");
    }
  };

  const removeTeacher = async (teacher: TeacherRecord) => {
    if (!window.confirm(`${t("Deactivate")} ${teacher.user.name}?`)) return;
    setBusyId(teacher.id);
    setError("");
    try {
      await api.delete(`/admin/teachers/${teacher.id}`);
      setTeachers((current) => current.filter((row) => row.id !== teacher.id));
      setNotice(t("Teacher deactivated. Their records have been retained."));
    } catch {
      setError(t("Could not deactivate teacher."));
    } finally {
      setBusyId("");
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7f4] p-5 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#526b5c]">{t("Administration Panel")}</p>
            <h1 className="mt-2 text-3xl font-bold text-[#26352e]">{t("Manage teachers")}</h1>
            <p className="mt-2 text-[#657168]">{t("Add, update, or deactivate teacher accounts.")}</p>
          </div>
          <div className="flex gap-3">
            <Button color="light" onClick={() => navigate("/admin/dashboard")}>{t("Dashboard")}</Button>
            <Button color="dark" onClick={() => navigate("/admin/create-teacher")}>{t("Create Teacher")}</Button>
          </div>
        </header>

        {notice && <p role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
        {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}

        {loading ? <div className="flex min-h-64 items-center justify-center"><Spinner size="xl" /></div> : teachers.length === 0 ? (
          <Card><div className="py-8 text-center"><h2 className="text-xl font-semibold">{t("No teachers available.")}</h2><p className="mt-2 text-[#657168]">{t("Create a teacher account to get started.")}</p></div></Card>
        ) : (
          <div className="space-y-4">
            {teachers.map((teacher) => <Card key={teacher.id} className="border-[#e2e8e3] shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  {teacher.user.profilePicture ? <img src={teacher.user.profilePicture} alt="" className="h-12 w-12 rounded-full object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#edf3ed] font-semibold text-[#24533e]">{teacher.user.name.slice(0, 1).toUpperCase()}</div>}
                  <div><h2 className="text-lg font-semibold text-[#26352e]">{teacher.user.name}</h2><p className="text-sm text-[#657168]">{teacher.user.email}</p><div className="mt-2 flex flex-wrap gap-2"><Badge color="info">{teacher.subject?.name ?? teacher.specialization ?? t("Teacher")}</Badge>{teacher.experience != null && <Badge color="gray">{teacher.experience} {t("years of experience")}</Badge>}</div></div>
                </div>
                <div className="flex gap-2">
                  <Button color="light" onClick={() => editingId === teacher.id ? setEditingId("") : beginEdit(teacher)}>{editingId === teacher.id ? t("Cancel") : t("Edit")}</Button>
                  <Button color="failure" disabled={busyId === teacher.id} onClick={() => void removeTeacher(teacher)}>{busyId === teacher.id ? <Spinner size="sm" /> : t("Deactivate")}</Button>
                </div>
              </div>

              {editingId === teacher.id && <form onSubmit={saveEdit} className="mt-5 grid gap-4 border-t border-[#e5e9e5] pt-5 md:grid-cols-2">
                {(["name", "email", "specialization", "experience", "qualifications", "bio"] as const).map((field) => <div key={field} className={field === "bio" || field === "qualifications" ? "md:col-span-2" : ""}>
                  <Label htmlFor={`${teacher.id}-${field}`}>{t(field === "name" ? "Name" : field === "email" ? "Email" : field === "experience" ? "Experience (Years)" : field === "bio" ? "Teacher Bio" : field === "qualifications" ? "Qualifications" : "Specialization")}</Label>
                  <TextInput id={`${teacher.id}-${field}`} type={field === "email" ? "email" : field === "experience" ? "number" : "text"} min={field === "experience" ? 0 : undefined} value={draft[field]} color={fieldErrors[field] ? "failure" : undefined} onChange={(event) => { setFieldErrors((current) => { const next = { ...current }; delete next[field]; return next; }); setDraft((current) => ({ ...current, [field]: event.target.value })); }} required={field === "name" || field === "email"} />
                  {fieldErrors[field] && <p role="alert" className="mt-1 text-sm text-red-700">{fieldErrors[field]}</p>}
                </div>)}
                <div className="flex justify-end gap-2 md:col-span-2"><Button type="submit" color="dark" disabled={busyId === teacher.id}>{busyId === teacher.id ? t("Saving…") : t("Save changes")}</Button></div>
              </form>}
            </Card>)}
          </div>
        )}
      </div>
    </main>
  );
}

export default AdminTeachers;

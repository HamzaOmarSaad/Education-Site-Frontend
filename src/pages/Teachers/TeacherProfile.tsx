import { useEffect, useState } from "react";
import { Button, Card, Spinner } from "flowbite-react";
import { useNavigate, useParams } from "react-router";
import { api, responseData } from "../../api/client";
import { useLanguage } from "../../context/language/LanguageContext";

type TeacherDetails = {
  teacher?: { id?: string; bio?: string; experience?: number; user?: { name?: string } };
  courses?: { id?: string; title?: string; description?: string }[];
};

export default function TeacherProfile() {
  const { t } = useLanguage();
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState<TeacherDetails | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get(`/user/teacher/${teacherId}`).then((response) => setDetails(responseData<TeacherDetails>(response)))
      .catch(() => setDetails(null)).finally(() => setLoading(false));
  }, [teacherId]);
  if (loading) return <div className="flex min-h-screen items-center justify-center"><Spinner size="xl" /></div>;
  if (!details) return <main className="mx-auto max-w-3xl p-10 text-center"><h1 className="text-2xl font-bold">{t("Teacher profile unavailable")}</h1><Button className="mx-auto mt-5" onClick={() => navigate("/teachers")}>{t("Back to teachers")}</Button></main>;
  return <main className="min-h-screen bg-gray-50 px-4 py-10"><div className="mx-auto max-w-5xl space-y-6">
    <Card><h1 className="text-3xl font-bold text-gray-900">{details.teacher?.user?.name ?? t("Teacher")}</h1><p className="text-gray-600">{details.teacher?.bio ?? t("Teacher profile")}</p>{details.teacher?.experience != null && <p className="text-sm text-gray-500">{details.teacher.experience} {t("years of experience")}</p>}</Card>
    <Card><h2 className="text-2xl font-bold">{t("Courses")}</h2>{details.courses?.length ? <div className="mt-4 grid gap-4 md:grid-cols-2">{details.courses.map((course) => <div key={course.id} className="rounded-xl border p-4"><h3 className="font-semibold">{course.title}</h3><p className="mt-2 text-sm text-gray-500">{course.description}</p><Button className="mt-4" onClick={() => navigate(`/courses/${course.id}`)}>{t("View course")}</Button></div>)}</div> : <p className="mt-3 text-gray-500">{t("No courses published yet.")}</p>}</Card>
  </div></main>;
}

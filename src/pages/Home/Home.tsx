import { useEffect, useState } from "react";
import { Button, Card, Spinner } from "flowbite-react";
import { Link } from "react-router";
import { ArrowLeft2, Book1, Teacher } from "iconsax-reactjs";
import { api } from "../../api/client";
import { useLanguage } from "../../context/language/LanguageContext";

type Course = { id?: string; _id?: string; title: string; description?: string; price?: number | string; subject?: { name?: string } };
type TeacherRecord = { id?: string; _id?: string; user?: { id?: string; name?: string }; bio?: string; specialization?: string };

function Home() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([api.get("/course/all"), api.get("/user/teachers")])
      .then(([courseResponse, teacherResponse]) => {
        if (!active) return;
        const courseRows = courseResponse.data?.data;
        const teacherRows = teacherResponse.data?.data;
        setCourses(Array.isArray(courseRows) ? courseRows.slice(0, 3) : []);
        setTeachers(Array.isArray(teacherRows) ? teacherRows.slice(0, 3) : []);
      })
      .catch(() => {
        if (active) {
          setCourses([]);
          setTeachers([]);
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <main className="min-h-screen bg-white text-[#26352e]">
      <section className="border-b border-[#e5e9e5] bg-[#f3f5f1]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#526b5c]">{t("A focused learning space")}</p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">{t("Learning, made clear.")}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#526158]">{t("A focused learning space for high school students, with clear lessons and thoughtful practice.")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/courses" className="inline-flex items-center rounded-lg bg-[#24533e] px-5 py-3 font-medium text-white hover:bg-[#1c4332]">{t("Explore courses")}<ArrowLeft2 size="18" className="ml-2" /></Link>
            <Link to="/signup" className="inline-flex items-center rounded-lg border border-[#cbd5cd] bg-white px-5 py-3 font-medium text-[#26352e] hover:bg-[#f7f8f6]">{t("Create an account")}</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div><div className="flex items-center gap-2 text-sm font-semibold text-[#526b5c]"><Book1 size="18" />{t("Courses")}</div><h2 className="mt-2 text-3xl font-bold">{t("Explore our courses")}</h2></div>
          <Link to="/courses" className="font-medium text-[#24533e] hover:underline">{t("View all courses")}</Link>
        </div>
        {loading ? <div className="flex min-h-36 items-center justify-center"><Spinner /></div> : courses.length ? (
          <div className="grid gap-5 md:grid-cols-3">{courses.map((course, index) => <Card key={course.id ?? course._id ?? `${course.title}-${index}`} className="h-full border-[#e2e8e3] shadow-sm"><p className="text-sm font-medium text-[#607265]">{course.subject?.name ?? t("Course")}</p><h3 className="mt-2 text-xl font-semibold">{course.title}</h3><p className="mt-2 line-clamp-3 text-sm leading-6 text-[#657168]">{course.description || t("Course details are available on the course page.")}</p><p className="mt-auto pt-5 font-semibold text-[#24533e]">{course.price === undefined ? t("View course") : `${course.price} ${t("EGP")}`}</p></Card>)}</div>
        ) : <p className="rounded-xl border border-dashed border-[#cbd5cd] px-6 py-10 text-center text-[#657168]">{t("No courses are available yet.")}</p>}
      </section>

      <section className="bg-[#f7f8f6]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div><div className="flex items-center gap-2 text-sm font-semibold text-[#526b5c]"><Teacher size="18" />{t("Teachers")}</div><h2 className="mt-2 text-3xl font-bold">{t("Meet our teachers")}</h2></div>
            <Link to="/teachers" className="font-medium text-[#24533e] hover:underline">{t("View all teachers")}</Link>
          </div>
          {loading ? <div className="flex min-h-36 items-center justify-center"><Spinner /></div> : teachers.length ? (
            <div className="grid gap-5 md:grid-cols-3">{teachers.map((teacher, index) => <Card key={teacher.id ?? teacher._id ?? index} className="border-[#e2e8e3] shadow-sm"><h3 className="text-xl font-semibold">{teacher.user?.name ?? t("Teacher")}</h3><p className="mt-1 text-sm font-medium text-[#526b5c]">{teacher.specialization ?? t("Teacher")}</p>{teacher.bio && <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#657168]">{teacher.bio}</p>}<Button as={Link} to={`/teacher/${teacher.user?.id ?? teacher.id ?? teacher._id}`} color="light" className="mt-5 w-full">{t("View profile")}</Button></Card>)}</div>
          ) : <p className="rounded-xl border border-dashed border-[#cbd5cd] bg-white px-6 py-10 text-center text-[#657168]">{t("No teachers are available yet.")}</p>}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 text-center lg:px-8">
        <h2 className="text-3xl font-bold">{t("Ready to begin?")}</h2>
        <p className="mx-auto mt-3 max-w-xl text-[#657168]">{t("Create an account to access courses and track your learning.")}</p>
        <Link to="/signup" className="mt-6 inline-flex rounded-lg bg-[#24533e] px-5 py-3 font-medium text-white hover:bg-[#1c4332]">{t("Create an account")}</Link>
      </section>
    </main>
  );
}

export default Home;

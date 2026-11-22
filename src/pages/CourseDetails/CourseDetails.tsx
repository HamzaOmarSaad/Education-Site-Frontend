import { useEffect, useState } from "react";
import { Button, Card, Spinner } from "flowbite-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import { api, responseData } from "../../api/client";
import { useLanguage } from "../../context/language/LanguageContext";

interface CourseLesson {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  duration?: string;
  quizzes?: { id?: string; title?: string }[];
}

interface CourseSection { id?: string; lessons?: CourseLesson[] }

interface CourseItem {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  teacher?: string;
  price?: number;
  lessons?: CourseLesson[];
  sections?: CourseSection[];
  teacherId?: string;
  quizId?: string;
}

function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [course, setCourse] = useState<CourseItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      const token = localStorage.getItem("token");

      try {
        const listResponse = await api.get("/course/all");
        const catalog = responseData<CourseItem[]>(listResponse);
        const item = catalog.find((candidate) => candidate.id === courseId || candidate._id === courseId);
        if (!item) { setCourse(null); return; }
        setCourse(item);
        if (token) {
          try {
            const detailResponse = await api.get(`/course/${courseId}`);
            setCourse(responseData<CourseItem>(detailResponse));
          } catch { /* Enrollment is required to see lesson content. */ }
        }
      } catch (error) {
        console.error("Course details error:", error);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      void loadCourse();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">{t("Course not found")}</h1>
          <p className="mt-3 text-gray-500">
            {t("The course you selected could not be loaded right now.")}
          </p>
          <Button
            color="blue"
            className="mt-6"
            onClick={() => navigate("/courses")}
          >
            {t("Back to courses")}
          </Button>
        </div>
      </main>
    );
  }

  const lessons = course.sections?.flatMap((section) => section.lessons ?? []) ?? course.lessons ?? [];
  const handleEnroll = async () => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    try {
      setEnrolling(true);
      await api.post(`/enrollment/enroll-course/${courseId}`, {});
      const response = await api.get(`/course/${courseId}`);
      setCourse(responseData<CourseItem>(response));
      toast.success(t("You are enrolled in this course."));
    } catch (error) {
      toast.error(axios.isAxiosError(error) ? error.response?.data?.message ?? t("Enrollment failed. Check your teacher subscription and wallet balance.") : t("Enrollment failed."));
    } finally { setEnrolling(false); }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-2xl bg-[#24533e] p-8 text-white shadow-md">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-blue-100">
                {t("Course overview")}
              </p>
              <h1 className="mt-3 text-3xl font-bold md:text-4xl">
                {course.title || t("Course")}
              </h1>
            </div>
            {lessons.length ? <p className="text-blue-100">{t("Your enrolled course")}</p> : <Button color="light" disabled={enrolling} onClick={() => void handleEnroll()}>{enrolling ? t("Enrolling…") : t("Enroll in course")}</Button>}
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <p className="text-sm text-gray-500">{t("Teacher")}</p>
            <p className="mt-2 text-xl font-bold text-gray-900">
              {course.teacher || t("Instructor")}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">{t("Price")}</p>
            <p className="mt-2 text-xl font-bold text-gray-900">
              {course.price ? `${course.price} EGP` : t("Free")}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">{t("Lessons")}</p>
            <p className="mt-2 text-xl font-bold text-gray-900">
              {lessons.length}
            </p>
          </Card>
        </div>

        <Card>
          <h2 className="text-2xl font-bold text-gray-900">
            {t("About this course")}
          </h2>
          <p className="mt-4 text-gray-600">
            {course.description || t("This course is designed to help learners build confidence through structured content, guided practice, and targeted revision.")}
          </p>
        </Card>

        <Card>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{t("Course content")}</h2>
            <Button size="sm" color="blue" onClick={() => navigate("/courses")}>
              {t("Back to catalog")}
            </Button>
          </div>

          {lessons.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
              {t("No lesson content has been added yet.")}
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <div
                  key={
                    lesson._id ?? lesson.id ?? `${course._id}-lesson-${index}`
                  }
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {lesson.title || `Lesson ${index + 1}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {lesson.description || t("Lesson description will appear here.")}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-blue-600">
                    {lesson.duration || "-"}
                  </span>
                  {lesson.quizzes?.map((quiz) => <Button key={quiz.id} size="xs" color="blue" onClick={() => navigate(`/quiz/${quiz.id}`)}>{quiz.title || t("Take quiz")}</Button>)}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}

export default CourseDetails;

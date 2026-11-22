import { Button, Card, Spinner } from "flowbite-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../../api/client";
import { useLanguage } from "../../context/language/LanguageContext";

interface CourseItem {
  id?: string;
  _id: string;
  title: string;
  description?: string;
  teacher?: string | { name?: string };
  price?: number;
}

function Courses() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/course/all");

        console.log("Courses API response:", response.data);

        const data = response.data;
        console.log(data);

        // Handle common backend response structures
        const coursesData = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data) ? data : [];

        setCourses(coursesData);
      } catch (err) {
        console.error("Courses error:", err);
        setError("Failed to load courses. Please try again.");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            {t("Learning catalog")}
          </p>

          <h1 className="mt-2 text-4xl font-bold text-gray-900">
            {t("Explore courses")}
          </h1>

          <p className="mt-3 text-gray-600">
            {t("Discover courses and improve your skills.")}
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-200">
            <p className="mb-4 text-red-600">{error}</p>

            <Button color="blue" onClick={() => window.location.reload()}>
              Try again
            </Button>
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow-sm ring-1 ring-gray-200">
            {t("No courses available right now.")}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id ?? course._id} className="flex h-full flex-col">
                <div className="inline-flex w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {t("Course")}
                </div>

                <h2 className="text-2xl font-bold text-gray-900">
                  {course.title}
                </h2>

                <p className="flex-1 text-sm text-gray-600">
                  {course.description ||
                    "Learn practical knowledge with guided lessons."}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {typeof course.teacher === "object"
                      ? course.teacher?.name || t("Instructor")
                      : course.teacher || t("Instructor")}
                  </span>

                  <span>
                    {course.price != null && course.price > 0
                      ? `${course.price} EGP`
                      : t("Free")}
                  </span>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    color="blue"
                    className="flex-1"
                    onClick={() => navigate(`/courses/${course.id ?? course._id}`)}
                  >
                    {t("View details")}
                  </Button>

                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Courses;

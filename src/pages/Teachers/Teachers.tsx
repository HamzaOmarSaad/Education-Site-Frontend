import { useContext, useEffect, useState } from "react";
import { Card, Button, Spinner } from "flowbite-react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

import img from "./../../assets/client02.png";
import { handleApiError } from "../../utils/common/errorHandler";
import { api } from "../../api/client";
import { userContext } from "../../context/userContext/contextCreation";
import { useLanguage } from "../../context/language/LanguageContext";

interface Teacher {
  id?: string;
  _id: string;
  user?: { id?: string; name?: string; profilePicture?: string };
  subject?: string;
  image?: string;
  bio?: string;
}

function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [requested, setRequested] = useState<string[]>([]);
  const { userData } = useContext(userContext);
  const { t } = useLanguage();

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const getTeachers = async () => {
      setLoading(true);

      try {
        const { data } = await api.get("/user/teachers");

        if (isMounted) {
          setTeachers(Array.isArray(data.data) ? data.data : []);
        }
      } catch (error: unknown) {
        if (isMounted) {
          handleApiError(error);
          setTeachers([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void getTeachers();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      {/* Hero Section */}
      <section className="mx-auto mb-16 max-w-7xl text-center">
        <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
          {t("Choose from the best")}
          <span className="block text-cyan-600">{t("teachers in Egypt")}</span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600 sm:text-xl">
          {t("Lectures, quizzes, books, homework, and everything you need to learn — all in one place.")}
        </p>
      </section>

      {/* Teachers Section */}
      <section className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{t("Our Teachers")}</h2>

          <p className="mt-2 text-gray-600">
            {t("Learn from experienced teachers and improve your skills.")}
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-60 items-center justify-center">
            <Spinner size="xl" />
          </div>
        ) : teachers.length === 0 ? (
          /* Empty State */
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">
              {t("No teachers found")}
            </h3>

            <p className="mt-2 text-gray-500">
              {t("There are no teachers available right now.")}
            </p>
          </div>
        ) : (
          /* Teachers Grid */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {teachers.map((teacher) => (
              <Card
                key={teacher._id}
                className="h-full transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex h-full flex-col items-center text-center">
                  <img
                    src={teacher.user?.profilePicture || teacher.image || img}
                    alt={teacher.user?.name || "Teacher"}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = img;
                    }}
                    className="mb-4 h-24 w-24 rounded-full object-cover shadow-md"
                  />

                  <h3 className="text-xl font-semibold text-gray-900">
                      {teacher.user?.name || "Teacher"}
                  </h3>

                  <span className="mt-1 text-sm font-medium text-cyan-600">
                    {teacher.subject || "Instructor"}
                  </span>

                  {teacher.bio && (
                    <p className="mt-3 line-clamp-2 text-sm text-gray-500">
                      {teacher.bio}
                    </p>
                  )}

                  <div className="mt-auto w-full pt-6">
                    <Button
                      color="cyan"
                      className="w-full rounded-lg"
                      onClick={() => navigate(`/teacher/${teacher.user?.id ?? teacher._id}`)}
                    >
                      {t("See Profile")}
                    </Button>
                    {userData && <Button color={requested.includes(teacher.id ?? teacher._id) ? "light" : "blue"} className="mt-2 w-full" disabled={requested.includes(teacher.id ?? teacher._id)} onClick={async () => {
                      try {
                        const teacherId = teacher.id ?? teacher._id;
                        await api.post(`/user/subscribe/${teacherId}`, {});
                        setRequested((previous) => [...previous, teacherId]);
                        toast.success("Subscription request sent.");
                      } catch (error) { handleApiError(error); }
                    }}>{requested.includes(teacher.id ?? teacher._id) ? t("Request sent") : t("Request subscription")}</Button>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Teachers;

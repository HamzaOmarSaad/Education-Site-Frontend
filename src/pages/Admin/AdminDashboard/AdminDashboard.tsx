import { useEffect, useState } from "react";
import { Card, Spinner, Badge } from "flowbite-react";
import { useNavigate } from "react-router";
import { api } from "../../../api/client";
import { useLanguage } from "../../../context/language/LanguageContext";

interface DashboardStats {
  students: number;
  teachers: number;
  courses: number;
}

interface Teacher {
  _id: string;
  name: string;
  email: string;
  subject: string;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [stats, setStats] = useState<DashboardStats>({
    students: 0,
    teachers: 0,
    courses: 0,
  });

  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      navigate("/admin/login");
      return;
    }

    const getDashboardData = async () => {
      const [teachersResult, coursesResult] = await Promise.allSettled([
        api.get("/admin/teachers"),
        api.get("/course/all"),
      ]);

      let teacherCount = 0;
      if (teachersResult.status === "fulfilled") {
        const rows = teachersResult.value.data?.data;
        const teacherRows = Array.isArray(rows) ? rows : [];
        teacherCount = teacherRows.length;
        setTeachers(teacherRows.slice(0, 8).map((teacher: any) => ({
          _id: teacher.id ?? teacher._id ?? teacher.user?.id,
          name: teacher.user?.name ?? teacher.name ?? "—",
          email: teacher.user?.email ?? teacher.email ?? "—",
          subject: teacher.subject?.name ?? teacher.specialization ?? "—",
        })));
      } else {
        console.error("Dashboard teacher request failed:", teachersResult.reason);
      }

      let courseCount = 0;
      if (coursesResult.status === "fulfilled") {
        const rows = coursesResult.value.data?.data;
        courseCount = Array.isArray(rows) ? rows.length : 0;
      } else {
        console.error("Dashboard course request failed:", coursesResult.reason);
      }
      setStats({ students: 0, teachers: teacherCount, courses: courseCount });
      setLoading(false);
    };

    void getDashboardData();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white">
        <div className="flex h-full flex-col">
          <div className="border-b px-6 py-6">
            <h1 className="text-2xl font-bold text-cyan-600">EduAdmin</h1>

            <p className="mt-1 text-sm text-gray-500">{t("Administration Panel")}</p>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="flex w-full items-center rounded-lg bg-cyan-50 px-4 py-3 text-left font-medium text-cyan-700"
            >
              {t("Dashboard")}
            </button>

            <button
              onClick={() => navigate("/admin/teachers")}
              className="flex w-full items-center rounded-lg px-4 py-3 text-left font-medium text-gray-600 hover:bg-gray-100"
            >
              {t("Teachers")}
            </button>

            <button
              onClick={() => navigate("/admin/create-teacher")}
              className="flex w-full items-center rounded-lg px-4 py-3 text-left font-medium text-gray-600 hover:bg-gray-100"
            >
              {t("Create Teacher")}
            </button>
          </nav>

          <div className="border-t p-4">
            <button
              onClick={logout}
              className="w-full rounded-lg px-4 py-3 text-left font-medium text-red-600 hover:bg-red-50"
            >
              {t("Logout")}
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{t("Dashboard")}</h2>

          <p className="mt-2 text-gray-500">
            {t("Overview of your education platform.")}
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <p className="text-sm font-medium text-gray-500">{t("Total Students")}</p>

            <p className="mt-2 text-4xl font-bold text-gray-900">
              —
            </p>

            <p className="mt-2 text-sm text-cyan-600">{t("Student count unavailable")}</p>
          </Card>

          <Card>
            <p className="text-sm font-medium text-gray-500">{t("Total Teachers")}</p>

            <p className="mt-2 text-4xl font-bold text-gray-900">
              {stats.teachers}
            </p>

            <p className="mt-2 text-sm text-cyan-600">{t("Active teachers")}</p>
          </Card>

          <Card>
            <p className="text-sm font-medium text-gray-500">{t("Total Courses")}</p>

            <p className="mt-2 text-4xl font-bold text-gray-900">
              {stats.courses}
            </p>

            <p className="mt-2 text-sm text-cyan-600">{t("Available courses")}</p>
          </Card>
        </div>

        {/* Students */}
        <Card className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{t("Students")}</h3>

              <p className="text-sm text-gray-500">
                {t("Recently registered students")}
              </p>
            </div>

          </div>

          <p className="rounded-xl bg-gray-50 p-5 text-sm text-gray-500">{t("The current backend does not expose a student directory endpoint.")}</p>
        </Card>

        {/* Teachers */}
        <Card className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{t("Teachers")}</h3>

              <p className="text-sm text-gray-500">
                {t("Teachers registered on the platform")}
              </p>
            </div>

            <button
              onClick={() => navigate("/admin/teachers")}
              className="text-sm font-medium text-cyan-600 hover:underline"
            >
              View all
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Subject
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {teachers.map((teacher) => (
                  <tr key={teacher._id} className="bg-white">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {teacher.name}
                    </td>

                    <td className="px-6 py-4">{teacher.email}</td>

                    <td className="px-6 py-4">
                      <Badge color="info">{teacher.subject}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}

export default AdminDashboard;

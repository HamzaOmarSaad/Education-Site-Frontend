import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Card, Spinner } from "flowbite-react";
import axios from "axios";
import { useNavigate } from "react-router";
import { api } from "../../../api/client";
import { useLanguage } from "../../../context/language/LanguageContext";

interface TeacherProfile {
  name?: string;
  email?: string;
  subject?: string;
  bio?: string;
}

interface StudentRecord {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  grade?: string;
  subject?: string;
}


function TeacherDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [profile, setProfile] = useState<TeacherProfile | null>(null);

  const [subscribedStudents, setSubscribedStudents] = useState<StudentRecord[]>(
    [],
  );

  const [studentRequests, setStudentRequests] = useState<StudentRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch dashboard data
  const fetchDashboard = useCallback(
    async (signal?: AbortSignal) => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const config = { signal };
      const [subscribedRes, requestsRes] = await Promise.all([
        api.get("/teacher/subscribed-students", config),
        api.get("/teacher/student-requests", config),
      ]);

      setProfile(null);

      setSubscribedStudents(
        subscribedRes.data?.data ?? subscribedRes.data ?? [],
      );

      setStudentRequests(requestsRes.data?.data ?? requestsRes.data ?? []);
    },
    [navigate],
  );

  // Initial dashboard loading
  useEffect(() => {
    const controller = new AbortController();

    const loadDashboard = async () => {
      try {
        await fetchDashboard(controller.signal);
      } catch (error) {
        if (controller.signal.aborted || axios.isCancel(error)) {
          return;
        }

        console.error("Teacher dashboard error:", error);

        setErrorMessage("Failed to load dashboard. Please try again.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      controller.abort();
    };
  }, [fetchDashboard]);

  // Approve a student request
  const handleApproveStudent = async (studentId: string) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setApprovingId(studentId);
      setErrorMessage("");

      await api.post(
        `/teacher/approve-student/${studentId}`,
        {},
      );

      // Remove the approved student from pending requests
      setStudentRequests((prev) =>
        prev.filter((student) => (student._id ?? student.id) !== studentId),
      );

      // Refresh dashboard data
      await fetchDashboard();
    } catch (error) {
      console.error("Approve student error:", error);

      setErrorMessage(
        axios.isAxiosError(error)
          ? error.response?.data?.message ||
              "Failed to approve student. Please try again."
          : "Something went wrong. Please try again.",
      );
    } finally {
      setApprovingId(null);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <section className="rounded-2xl bg-[#24533e] p-8 text-white shadow-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-100">
                {t("Teacher portal")}
              </p>

              <h1 className="mt-3 text-3xl font-bold md:text-4xl">
                {t("Welcome back, ")}{profile?.name?.split(" ")[0] || t("Teacher")}
              </h1>

              <p className="mt-2 text-cyan-100">
                {t("Manage your students and classroom.")}
              </p>
            </div>

            <Button
              color="light"
              className="w-fit rounded-xl px-5 py-2.5"
              onClick={() => navigate("/teacher/workspace")}
            >
              {t("Manage classroom")}
            </Button>
          </div>
        </section>

        {/* Error message */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <span>{errorMessage}</span>

            <Button
              size="xs"
              color="failure"
              onClick={() => setErrorMessage("")}
            >
              {t("Dismiss")}
            </Button>
          </div>
        )}

        {/* Dashboard statistics */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <p className="text-sm font-medium text-gray-500">{t("Subject")}</p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {profile?.subject || t("General")}
            </p>
          </Card>

          <Card>
            <p className="text-sm font-medium text-gray-500">
              {t("Approved students")}
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {subscribedStudents.length}
            </p>
          </Card>

          <Card>
            <p className="text-sm font-medium text-gray-500">
              {t("Pending requests")}
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {studentRequests.length}
            </p>
          </Card>
        </div>

        {/* Students sections */}
        <div className="grid gap-6 xl:grid-cols-2">
          {/* Approved students */}
          <Card>
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-gray-900">
                {t("Subscribed students")}
              </h2>

              <p className="text-sm text-gray-500">
                {t("Students currently enrolled with you")}
              </p>
            </div>

            {subscribedStudents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-500">
                {t("No approved students yet.")}
              </div>
            ) : (
              <div className="space-y-3">
                {subscribedStudents.map((student, index) => (
                  <div
                    key={student._id ?? student.id ?? index}
                    className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">
                        {student.name || t("Student")}
                      </p>

                      <p className="break-all text-sm text-gray-500">
                        {student.email || "No email"}
                      </p>

                      {student.grade && (
                        <p className="mt-1 text-xs text-gray-400">
                          Grade: {student.grade}
                        </p>
                      )}
                    </div>

                    <Badge color="success">{t("Active")}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Pending student requests */}
          <Card>
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-gray-900">{t("Student requests")}</h2>

              <p className="text-sm text-gray-500">
                {t("Approve new course subscriptions")}
              </p>
            </div>

            {studentRequests.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-500">
                {t("There are no pending requests.")}
              </div>
            ) : (
              <div className="space-y-3">
                {studentRequests.map((student, index) => {
                  const studentId = student._id ?? student.id ?? "";

                  return (
                    <div
                      key={studentId || index}
                      className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">
                          {student.name || t("New student")}
                        </p>

                        <p className="break-all text-sm text-gray-500">
                          {student.email || "No email"}
                        </p>

                        {student.grade && (
                          <p className="mt-1 text-xs text-gray-400">
                            Grade: {student.grade}
                          </p>
                        )}
                      </div>

                      <Button
                        color="success"
                        size="sm"
                        disabled={!studentId || approvingId !== null}
                        onClick={() => void handleApproveStudent(studentId)}
                      >
                        {approvingId === studentId ? t("Approving...") : t("Approve")}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}

export default TeacherDashboard;

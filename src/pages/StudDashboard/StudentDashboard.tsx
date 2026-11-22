import { useContext, useEffect, useState } from "react";
import { Button, Card, Spinner, TextInput } from "flowbite-react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { handleApiError } from "../../utils/common/errorHandler";
import { userContext } from "../../context/userContext/contextCreation";
import { api } from "../../api/client";
import { useLanguage } from "../../context/language/LanguageContext";

interface CourseItem {
  id: string;
  course?: { id: string; title: string; description?: string };
  title: string;
  description?: string;
  teacher?: string;
}

function StudentDashboard() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [voucherCode, setVoucherCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { userData } = useContext(userContext);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchDashboard = async () => {
      try {
        const coursesResponse = await api.get("/course", { headers: { Authorization: `Bearer ${token}` } });
        console.log(
          "🚀 ~ fetchDashboard ~ coursesResponse:",
          coursesResponse.data.data,
        );

        setCourses(coursesResponse.data?.data ?? coursesResponse.data ?? []);
      } catch (error) {
        handleApiError(error);
        console.error("Student dashboard error:", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      void fetchDashboard();
    }
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
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-2xl bg-[#24533e] p-8 text-white shadow-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-blue-100">
                {t("Student portal")}
              </p>
              <h1 className="mt-3 text-3xl font-bold md:text-4xl">
                {t("Welcome back, ")}{userData?.name?.split(" ")[0] || t("Student")}
              </h1>
            </div>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <p className="text-sm font-medium text-gray-500">{t("School")}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {userData?.studentProfile?.school || t("Not set")}
            </p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-gray-500">{t("Grade")}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {userData?.grade?.name || t("Not set")}
            </p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-gray-500">{t("Track")}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {userData?.track?.name || t("Not set")}
            </p>
          </Card>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t("My courses")}</h2>
              <p className="text-sm text-gray-500">{t("Your active learning path")}</p>
            </div>
          </div>

          {courses?.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
              {t("No courses available yet.")}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {courses?.map((course) => (
                <Card key={course.course?.id ?? course.id} className="h-full">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {course.course?.title ?? course.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {course.course?.description ?? course.description ?? "Continue your course journey."}
                  </p>
                  <div className="mt-4 text-sm font-medium text-blue-600">
                    {course.teacher || t("Teacher available")}
                  </div>
                  <Button color="blue" onClick={() => navigate(`/courses/${course.course?.id ?? course.id}`)}>{t("Open course")}</Button>
                </Card>
              ))}
            </div>
          )}
        </section>
        <Card>
          <h2 className="text-xl font-bold text-gray-900">{t("Redeem a voucher")}</h2>
          <p className="text-sm text-gray-500">{t("Apply a voucher code to your teacher wallet balance.")}</p>
          <form className="mt-3 flex flex-col gap-3 sm:flex-row" onSubmit={async (event) => {
            event.preventDefault();
            setRedeeming(true);
            try {
              await api.post("/payment/redeem-voucher", { code: voucherCode.trim() });
              setVoucherCode("");
              toast.success("Voucher redeemed successfully.");
            } catch (error) { handleApiError(error); }
            finally { setRedeeming(false); }
          }}>
            <TextInput className="flex-1" value={voucherCode} onChange={(event) => setVoucherCode(event.target.value)} placeholder="EDU-…" required />
            <Button type="submit" disabled={redeeming}>{redeeming ? t("Redeeming…") : t("Redeem")}</Button>
          </form>
        </Card>
      </div>
    </main>
  );
}

export default StudentDashboard;

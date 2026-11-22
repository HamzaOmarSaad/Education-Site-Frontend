import { useEffect, useState } from "react";
import { Button, Card, Spinner } from "flowbite-react";
import { api, responseData } from "../../api/client";
import { useLanguage } from "../../context/language/LanguageContext";

type CatalogSubject = {
  id: string;
  name: string;
  description?: string;
  courseCount: number;
  track: { name: string; academicYear: { year: number; grade: { name: string } } };
};

function Subjects() {
  const { t } = useLanguage();
  const [subjects, setSubjects] = useState<CatalogSubject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/course/subjects")
      .then((response) => setSubjects(responseData<CatalogSubject[]>(response)))
      .catch(() => setSubjects([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">{t("Learning catalog")}</p>
          <h1 className="mt-2 text-4xl font-bold text-gray-900">{t("Explore subjects")}</h1>
          <p className="mt-3 text-gray-600">{t("Browse subjects through their available courses.")}</p>
        </div>
        {loading ? <div className="flex min-h-60 items-center justify-center"><Spinner size="xl" /></div> : subjects.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow-sm ring-1 ring-gray-200">{t("No subjects are available for this academic year.")}</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {subjects.map((subject) => <Card key={subject.id}>
              <div className="mb-4 inline-flex w-fit rounded-full bg-[#edf3ed] px-3 py-1 text-xs font-semibold text-[#24533e]">{t(subject.track.academicYear.grade.name)} · {t(subject.track.name)} · {subject.track.academicYear.year}</div>
              <h2 className="text-2xl font-bold text-gray-900">{subject.name}</h2>
              <p className="mt-3 text-sm text-gray-600">{subject.description || t("Subject curriculum")}</p>
              <p className="mt-3 text-sm text-gray-500">{subject.courseCount} {t("courses available")}</p>
              <Button color="light" className="mt-5" href="/courses">{t("Browse courses")}</Button>
            </Card>)}
          </div>
        )}
      </div>
    </main>
  );
}

export default Subjects;

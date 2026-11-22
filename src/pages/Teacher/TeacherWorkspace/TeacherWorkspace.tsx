import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Label, Select, TextInput, Textarea } from "flowbite-react";
import { Link, useLocation } from "react-router";
import { api } from "../../../api/client";
import axios from "axios";
import toast from "react-hot-toast";
import { useLanguage } from "../../../context/language/LanguageContext";
import { getApiErrorInfo } from "../../../utils/common/errorHandler";

type Option = { id: string; name?: string; title?: string; order?: number; courseId?: string; sectionId?: string };
type SubjectOption = Option & { track?: { name: string; academicYear?: { year?: number; grade?: { id?: string; name?: string } } } };
type WorkspaceOptions = { teacherProfileId: string | null; grades: Option[]; subjects: SubjectOption[]; courses: Option[]; sections: Option[]; lessons: Option[] };
const emptyOptions: WorkspaceOptions = { teacherProfileId: null, grades: [], subjects: [], courses: [], sections: [], lessons: [] };
type QuizAnswerDraft = { text: string; isCorrect: boolean };
type QuizQuestionDraft = { question: string; type: "SINGLE_CHOICE" | "TRUE_FALSE"; points: number; answers: QuizAnswerDraft[] };
const newQuestion = (): QuizQuestionDraft => ({ question: "", type: "SINGLE_CHOICE", points: 1, answers: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }] });

export default function TeacherWorkspace() {
  const { t } = useLanguage();
  const location = useLocation();
  const page = location.pathname.endsWith("/quizzes") ? "quiz" : location.pathname.endsWith("/vouchers") ? "voucher" : "content";
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [options, setOptions] = useState<WorkspaceOptions>(emptyOptions);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState(false);
  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [quizLessonId, setQuizLessonId] = useState("");
  const [courseFile, setCourseFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [quizPassingScore, setQuizPassingScore] = useState("60");
  const [quizTimeLimit, setQuizTimeLimit] = useState("");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionDraft[]>([newQuestion()]);
  const [createdIds, setCreatedIds] = useState<{ course?: string; section?: string; voucher?: string }>({});

  const loadOptions = async () => {
    setOptionsLoading(true);
    try {
      const { data } = await api.get("/course/teacher/options");
      setOptions({ ...emptyOptions, ...(data?.data ?? {}) });
      setOptionsError(false);
    } catch {
      setOptionsError(true);
    } finally {
      setOptionsLoading(false);
    }
  };
  useEffect(() => { void loadOptions(); }, []);

  const subjectsForGrade = useMemo(
    () => options.subjects.filter((subject) => subject.track?.academicYear?.grade?.id === selectedGradeId),
    [options.subjects, selectedGradeId],
  );

  const run = async (key: string, action: () => Promise<unknown>, refreshOptions = false) => {
    setBusy(key); setError(""); setFieldErrors({}); setUploadSuccess("");
    if (key === "video" || key === "attachment") setUploadProgress(0);
    try {
      await action();
      toast.success(t("Saved successfully."));
      if (key === "video" || key === "attachment") setUploadSuccess(t(key === "video" ? "Video uploaded and lesson created." : "Attachment uploaded and lesson created."));
      if (refreshOptions) await loadOptions();
    } catch (cause) {
      const info = getApiErrorInfo(cause);
      const message = info.fieldErrors.length ? info.message : axios.isAxiosError(cause)
        ? info.message || t("The request failed. Check the fields and try again.")
        : cause instanceof Error ? cause.message : t("The request failed.");
      setFieldErrors(Object.fromEntries(info.fieldErrors.map((issue) => [issue.field, issue.message])));
      setError(message); toast.error(message); setUploadProgress(null);
    } finally { setBusy(""); }
  };

  const submitCourse = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (courseFile) form.set("file", courseFile);
    const teacherId = localStorage.getItem("teacherId");
    if (teacherId) form.set("teacherId", teacherId);
    void run("course", async () => {
      const response = await api.post("/course/create", form);
      setCreatedIds((previous) => ({ ...previous, course: response.data?.data?.id ?? response.data?.data?._id }));
      return response;
    }, true);
  };
  const submitSection = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    void run("section", async () => {
      const response = await api.post("/course/create-section", {
        title: form.get("title"), courseId: form.get("courseId"), order: Number(form.get("order")), description: form.get("description") || undefined,
      });
      setCreatedIds((previous) => ({ ...previous, section: response.data?.data?.id ?? response.data?.data?._id }));
      return response;
    }, true);
  };
  const submitAsset = (event: React.FormEvent<HTMLFormElement>, kind: "video" | "attachment") => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const file = kind === "video" ? videoFile : attachmentFile;
    if (!file) { setError(t(`Choose a ${kind} file first.`)); return; }
    const payload = new FormData();
    const fields = kind === "video" ? ["sectionId", "title", "description", "content", "order", "duration"] : ["sectionId", "title", "description", "content", "order"];
    for (const key of fields) {
      const value = form.get(key); if (value) payload.set(key, value);
    }
    payload.set(kind, file);
    void run(kind, () => api.post(`/lesson/create-lesson-${kind}`, payload, {
      onUploadProgress: (event) => {
        if (event.total) setUploadProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
      },
    }), true);
  };
  const submitQuiz = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!quizLessonId) { setError(t("Choose a lesson for this quiz.")); return; }
    if (!quizQuestions.length || quizQuestions.some((question) => !question.question.trim() || question.answers.some((answer) => !answer.text.trim()))) {
      setError(t("Complete each question and answer before saving.")); return;
    }
    if (quizQuestions.some((question) => !question.answers.some((answer) => answer.isCorrect))) {
      setError(t("Mark at least one correct answer for every question.")); return;
    }
    void run("quiz", async () => {
      const questions = quizQuestions.map((question, questionIndex) => ({
        ...question,
        order: questionIndex + 1,
        answers: question.answers.map((answer, answerIndex) => ({ ...answer, order: answerIndex + 1 })),
      }));
      const payload = {
        lessonId: quizLessonId,
        title: quizTitle.trim(),
        description: quizDescription.trim() || undefined,
        passingScore: quizPassingScore ? Number(quizPassingScore) : undefined,
        timeLimit: quizTimeLimit ? Number(quizTimeLimit) : undefined,
        questions,
      };
      const response = await api.post("/quiz/create-quiz", payload);
      setQuizTitle(""); setQuizDescription(""); setQuizQuestions([newQuestion()]);
      return response;
    }, true);
  };

  const updateQuestion = (index: number, update: Partial<QuizQuestionDraft>) => {
    setQuizQuestions((current) => current.map((question, questionIndex) => questionIndex === index ? { ...question, ...update } : question));
  };
  const updateAnswer = (questionIndex: number, answerIndex: number, update: Partial<QuizAnswerDraft>) => {
    setQuizQuestions((current) => current.map((question, index) => index === questionIndex ? {
      ...question,
      answers: question.answers.map((answer, choiceIndex) => choiceIndex === answerIndex ? { ...answer, ...update } : answer),
    } : question));
  };
  const submitVoucher = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    if (!options.teacherProfileId) { setError(t("Your teacher profile is not available.")); return; }
    void run("voucher", async () => {
      const response = await api.post("/payment/create-voucher", {
        teacherId: options.teacherProfileId, amount: Number(form.get("amount")), expiresAt: form.get("expiresAt"),
      });
      setCreatedIds((previous) => ({ ...previous, voucher: response.data?.data?.code }));
      return response;
    });
  };

  return <main className="min-h-screen bg-gray-50 px-4 py-10"><div className="mx-auto max-w-5xl space-y-6">
    <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">{t("Teacher portal")}</p><h1 className="mt-2 text-3xl font-bold text-gray-900">{t(page === "quiz" ? "Quiz workspace" : page === "voucher" ? "Voucher workspace" : "Course workspace")}</h1><p className="mt-2 text-gray-600">{t(page === "quiz" ? "Create quizzes for your lessons." : page === "voucher" ? "Create vouchers for your teacher account." : "Create courses and add sections and lessons.")}</p><Link className="mt-2 inline-block text-blue-600 hover:underline" to="/teacher/dashboard">{t("Back to dashboard")}</Link></div>
    <nav aria-label={t("Teacher workspace pages")} className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-2">
      <WorkspaceNavLink to="/teacher/workspace" active={page === "content"}>{t("Courses and lessons")}</WorkspaceNavLink>
      <WorkspaceNavLink to="/teacher/workspace/quizzes" active={page === "quiz"}>{t("Quizzes")}</WorkspaceNavLink>
      <WorkspaceNavLink to="/teacher/workspace/vouchers" active={page === "voucher"}>{t("Vouchers")}</WorkspaceNavLink>
    </nav>
    {error && <Alert color="failure">{error}</Alert>}
    {uploadSuccess && <Alert color="success" role="status">{uploadSuccess}</Alert>}
    {(busy === "video" || busy === "attachment") && <section className="rounded-xl border border-gray-200 bg-white p-4" role="status" aria-live="polite">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm font-medium text-gray-800"><span>{uploadProgress === null || uploadProgress >= 100 ? t("Upload received; saving the lesson…") : t("Uploading file…")}</span>{uploadProgress !== null && uploadProgress < 100 && <span>{uploadProgress}%</span>}</div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full bg-[#24533e] transition-[width] duration-200 ${uploadProgress === null || uploadProgress >= 100 ? "w-full animate-pulse" : ""}`} style={uploadProgress !== null && uploadProgress < 100 ? { width: `${uploadProgress}%` } : undefined} /></div>
      <p className="mt-2 text-xs text-gray-500">{t("Large videos can take a little longer while they are processed.")}</p>
    </section>}
    {optionsError && <Alert color="failure">{t("Could not load teacher options. Refresh and try again.")}</Alert>}
    {(createdIds.course || createdIds.section || createdIds.voucher) && <Alert color="success">{createdIds.course && <p>{t("Course ID:")} <code>{createdIds.course}</code></p>}{createdIds.section && <p>{t("Section ID:")} <code>{createdIds.section}</code></p>}{createdIds.voucher && <p>{t("Voucher code:")} <code>{createdIds.voucher}</code></p>}</Alert>}

    {page === "content" && <>
    <Card><h2 className="text-xl font-bold">{t("Create a course")}</h2><form onSubmit={submitCourse} className="grid gap-4 sm:grid-cols-2">
      <Field name="title" label="Course title" required error={fieldErrors.title} /><Field name="name" label="Course name" required error={fieldErrors.name} />
      <SelectField name="gradeId" label="Grade" options={options.grades.map((grade) => ({ value: grade.id, label: grade.name ?? "" }))} value={selectedGradeId} onChange={(event) => { setSelectedGradeId(event.target.value); setSelectedSubjectId(""); }} required disabled={optionsLoading} error={fieldErrors.gradeId} />
      <SelectField name="subjectId" label="Subject" options={subjectsForGrade.map((subject) => ({ value: subject.id, label: `${subject.name} · ${subject.track?.name ?? ""}` }))} value={selectedSubjectId} onChange={(event) => setSelectedSubjectId(event.target.value)} required disabled={optionsLoading || !selectedGradeId} error={fieldErrors.subjectId} />
      <Field name="price" label="Price" type="number" required error={fieldErrors.price} /><Field name="description" label="Description" error={fieldErrors.description} />
      <div><Label htmlFor="course-thumbnail">{t("Thumbnail image")}</Label><input id="course-thumbnail" type="file" accept="image/*" required onChange={(event) => setCourseFile(event.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm" />{fieldErrors.file && <InputError message={fieldErrors.file} />}</div>
      <Button type="submit" disabled={!!busy || optionsLoading}>{busy === "course" ? t("Saving…") : t("Create course")}</Button>
    </form></Card>

    <Card><h2 className="text-xl font-bold">{t("Add a section")}</h2><form onSubmit={submitSection} className="grid gap-4 sm:grid-cols-2">
      <SelectField name="courseId" label="Course" options={options.courses.map((course) => ({ value: course.id, label: course.title ?? course.name ?? "" }))} required disabled={optionsLoading || options.courses.length === 0} error={fieldErrors.courseId} />
      <Field name="title" label="Section title" required error={fieldErrors.title} /><Field name="order" label="Order" type="number" required error={fieldErrors.order} /><Field name="description" label="Description" error={fieldErrors.description} /><Button type="submit" disabled={!!busy || options.courses.length === 0}>{busy === "section" ? t("Saving…") : t("Create section")}</Button>
    </form></Card>

    <Card><h2 className="text-xl font-bold">{t("Add a lesson video")}</h2><AssetForm kind="video" sections={options.sections} fieldErrors={fieldErrors} setFile={setVideoFile} busy={busy === "video"} disabled={optionsLoading} onSubmit={(event) => submitAsset(event, "video")} /></Card>
    <Card><h2 className="text-xl font-bold">{t("Add a lesson attachment")}</h2><AssetForm kind="attachment" sections={options.sections} fieldErrors={fieldErrors} setFile={setAttachmentFile} busy={busy === "attachment"} disabled={optionsLoading} onSubmit={(event) => submitAsset(event, "attachment")} /></Card>
    </>}

    {page === "quiz" && <Card><h2 className="text-xl font-bold">{t("Create a quiz")}</h2><p className="text-sm text-gray-500">{t("Add the quiz details, then write questions and mark their correct answers.")}</p><form onSubmit={submitQuiz} className="space-y-5">
      <SelectField name="quizLessonId" label="Lesson" options={options.lessons.map((lesson) => ({ value: lesson.id, label: `${options.sections.find((section) => section.id === lesson.sectionId)?.title ?? t("Section")} · ${lesson.title ?? t("Lesson")}` }))} value={quizLessonId} onChange={(event) => setQuizLessonId(event.target.value)} required disabled={optionsLoading || options.lessons.length === 0} error={fieldErrors.lessonId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label htmlFor="quiz-title">{t("Quiz title")}</Label><TextInput id="quiz-title" value={quizTitle} onChange={(event) => setQuizTitle(event.target.value)} required />{fieldErrors.title && <InputError message={fieldErrors.title} />}</div>
        <div><Label htmlFor="quiz-description">{t("Description")}</Label><TextInput id="quiz-description" value={quizDescription} onChange={(event) => setQuizDescription(event.target.value)} />{fieldErrors.description && <InputError message={fieldErrors.description} />}</div>
        <div><Label htmlFor="quiz-passing-score">{t("Passing score (%)")}</Label><TextInput id="quiz-passing-score" type="number" min={0} max={100} value={quizPassingScore} onChange={(event) => setQuizPassingScore(event.target.value)} />{fieldErrors.passingScore && <InputError message={fieldErrors.passingScore} />}</div>
        <div><Label htmlFor="quiz-time-limit">{t("Time limit (minutes)")}</Label><TextInput id="quiz-time-limit" type="number" min={1} value={quizTimeLimit} onChange={(event) => setQuizTimeLimit(event.target.value)} />{fieldErrors.timeLimit && <InputError message={fieldErrors.timeLimit} />}</div>
      </div>
      <div className="space-y-4">
        {quizQuestions.map((question, questionIndex) => <div key={questionIndex} className="rounded-xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3"><h3 className="font-semibold">{t("Question")} {questionIndex + 1}</h3>{quizQuestions.length > 1 && <Button type="button" color="light" size="xs" onClick={() => setQuizQuestions((current) => current.filter((_, index) => index !== questionIndex))}>{t("Remove question")}</Button>}</div>
          <div className="grid gap-4 sm:grid-cols-[1fr_1fr_120px]">
            <div className="sm:col-span-3"><Label htmlFor={`quiz-question-${questionIndex}`}>{t("Question text")}</Label><Textarea id={`quiz-question-${questionIndex}`} rows={2} value={question.question} onChange={(event) => updateQuestion(questionIndex, { question: event.target.value })} required />{fieldErrors[`questions.${questionIndex}.question`] && <InputError message={fieldErrors[`questions.${questionIndex}.question`]} />}</div>
            <div><Label htmlFor={`quiz-type-${questionIndex}`}>{t("Question type")}</Label><Select id={`quiz-type-${questionIndex}`} value={question.type} onChange={(event) => {
              const type = event.target.value as QuizQuestionDraft["type"];
              if (type === "TRUE_FALSE") updateQuestion(questionIndex, { type, answers: [{ text: "True", isCorrect: true }, { text: "False", isCorrect: false }] });
              else updateQuestion(questionIndex, { type });
            }}><option value="SINGLE_CHOICE">{t("Single choice")}</option><option value="TRUE_FALSE">{t("True or false")}</option></Select></div>
            <div><Label htmlFor={`quiz-points-${questionIndex}`}>{t("Points")}</Label><TextInput id={`quiz-points-${questionIndex}`} type="number" min={1} value={question.points} onChange={(event) => updateQuestion(questionIndex, { points: Math.max(1, Number(event.target.value)) })} required />{fieldErrors[`questions.${questionIndex}.points`] && <InputError message={fieldErrors[`questions.${questionIndex}.points`]} />}</div>
          </div>
          <div className="mt-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">{t("Answer choices")}</p>
            {question.answers.map((answer, answerIndex) => <div key={answerIndex} className="flex flex-wrap items-center gap-3">
              <div className="min-w-48 flex-1"><TextInput aria-label={`${t("Answer")} ${answerIndex + 1}`} placeholder={`${t("Answer")} ${answerIndex + 1}`} value={answer.text} onChange={(event) => updateAnswer(questionIndex, answerIndex, { text: event.target.value })} required />{fieldErrors[`questions.${questionIndex}.answers.${answerIndex}.text`] && <InputError message={fieldErrors[`questions.${questionIndex}.answers.${answerIndex}.text`]} />}</div>
              <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={answer.isCorrect} onChange={(event) => {
                if (question.type === "SINGLE_CHOICE" || question.type === "TRUE_FALSE") {
                  setQuizQuestions((current) => current.map((item, index) => index === questionIndex ? { ...item, answers: item.answers.map((choice, choiceIndex) => ({ ...choice, isCorrect: choiceIndex === answerIndex ? event.target.checked : false })) } : item));
                } else updateAnswer(questionIndex, answerIndex, { isCorrect: event.target.checked });
              }} />{t("Correct answer")}</label>
              {question.answers.length > 1 && <Button type="button" color="light" size="xs" onClick={() => setQuizQuestions((current) => current.map((item, index) => index === questionIndex ? { ...item, answers: item.answers.filter((_, choiceIndex) => choiceIndex !== answerIndex) } : item))}>{t("Remove")}</Button>}
            </div>)}
            <Button type="button" color="light" size="xs" onClick={() => setQuizQuestions((current) => current.map((item, index) => index === questionIndex ? { ...item, answers: [...item.answers, { text: "", isCorrect: false }] } : item))}>{t("Add answer")}</Button>
          </div>
        </div>)}
      </div>
      <div className="flex flex-wrap gap-3"><Button type="button" color="light" onClick={() => setQuizQuestions((current) => [...current, newQuestion()])}>{t("Add question")}</Button><Button type="submit" disabled={!!busy || options.lessons.length === 0 || !quizTitle.trim()}>{busy === "quiz" ? t("Saving…") : t("Create quiz")}</Button></div>
    </form></Card>}

    {page === "voucher" && <Card><h2 className="text-xl font-bold">{t("Create a voucher")}</h2><p className="mb-3 text-sm text-gray-500">{t("Voucher will be created for your teacher account.")}</p><form onSubmit={submitVoucher} className="grid gap-4 sm:grid-cols-2"><Field name="amount" label="Amount" type="number" required error={fieldErrors.amount} /><Field name="expiresAt" label="Expires at" type="datetime-local" required error={fieldErrors.expiresAt} /><Button type="submit" disabled={!!busy || !options.teacherProfileId}>{busy === "voucher" ? t("Saving…") : t("Create voucher")}</Button></form></Card>}
  </div></main>;
}

function WorkspaceNavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return <Link to={to} className={`rounded-lg px-4 py-2 text-sm font-medium ${active ? "bg-[#24533e] text-white" : "text-gray-600 hover:bg-gray-100"}`}>{children}</Link>;
}

function Field({ name, label, type = "text", required = false, error }: { name: string; label: string; type?: string; required?: boolean; error?: string }) {
  const { t } = useLanguage();
  return <div><Label htmlFor={name}>{t(label)}</Label><TextInput id={name} name={name} type={type} required={required} min={type === "number" ? 1 : undefined} color={error ? "failure" : "gray"} />{error && <InputError message={error} />}</div>;
}

function SelectField({ name, label, options, value, onChange, required = false, disabled = false, error }: { name: string; label: string; options: Array<{ value: string; label: string }>; value?: string; onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void; required?: boolean; disabled?: boolean; error?: string }) {
  const { t } = useLanguage();
  return <div><Label htmlFor={name}>{t(label)}</Label><Select id={name} name={name} value={value} onChange={onChange} required={required} disabled={disabled} color={error ? "failure" : "gray"}><option value="">{t("Choose an option")}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select>{error && <InputError message={error} />}</div>;
}

function AssetForm({ kind, sections, fieldErrors, setFile, busy, disabled, onSubmit }: { kind: "video" | "attachment"; sections: Option[]; fieldErrors: Record<string, string>; setFile: (file: File | null) => void; busy: boolean; disabled: boolean; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  const { t } = useLanguage();
  return <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
    <SelectField name="sectionId" label="Section" options={sections.map((section) => ({ value: section.id, label: section.title ?? "" }))} required disabled={disabled || sections.length === 0} error={fieldErrors.sectionId} />
    <Field name="title" label="Lesson title" required error={fieldErrors.title} /><Field name="order" label="Order" type="number" required error={fieldErrors.order} />{kind === "video" && <Field name="duration" label="Duration (seconds)" type="number" error={fieldErrors.duration} />}<Field name="description" label="Description" error={fieldErrors.description} />
    <div><Label htmlFor={`${kind}-file`}>{t(kind === "video" ? "Video file" : "Attachment file")}</Label><input id={`${kind}-file`} type="file" accept={kind === "video" ? "video/mp4,video/webm,video/quicktime,video/matroska,video/x-matroska,.mkv" : ".pdf,.docx,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"} required onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm" />{fieldErrors.file && <InputError message={fieldErrors.file} />}</div>
    <Button type="submit" disabled={busy || disabled || sections.length === 0}>{busy ? t("Uploading…") : t(kind === "video" ? "Add video" : "Add attachment")}</Button>
  </form>;
}

function InputError({ message }: { message?: string }) {
  return message ? <p role="alert" className="mt-1 text-sm text-red-700">{message}</p> : null;
}

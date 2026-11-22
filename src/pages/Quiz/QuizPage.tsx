import { useEffect, useState } from "react";
import { Button, Card, Radio, Spinner } from "flowbite-react";
import { useNavigate, useParams } from "react-router";
import { api, responseData } from "../../api/client";
import { useLanguage } from "../../context/language/LanguageContext";

interface QuizAnswer {
  _id?: string;
  id?: string;
  text?: string;
  isCorrect?: boolean;
}

interface QuizQuestion {
  _id?: string;
  id?: string;
  question?: string;
  type?: string;
  answers?: QuizAnswer[];
  order?: number;
}

interface QuizData {
  _id?: string;
  id?: string;
  title?: string;
  lessonId?: string;
  questions?: QuizQuestion[];
}

function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [result, setResult] = useState<{
    score?: number;
    percentage?: number;
    passed?: boolean;
  } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const loadQuiz = async () => {
      try {
        if (!token || !quizId) return;
        const attemptResponse = await api.post(`/quiz/start-quiz/${quizId}`, {});
        const attempt = responseData<{ id?: string; attemptId?: string }>(attemptResponse);
        const id = attempt.id ?? attempt.attemptId;
        if (!id) throw new Error("Quiz attempt was not returned by the server.");
        setAttemptId(id);
        const quizResponse = await api.get(`/quiz/${quizId}`);
        setQuiz(responseData<QuizData>(quizResponse));
      } catch (error) {
        console.error("Quiz load error:", error);
        setQuiz(null);
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      void loadQuiz();
    }
  }, [quizId]);

  const handleAnswerChange = (questionId: string, answerId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const handleSubmitQuiz = async () => {
    if (!attemptId) return;

    try {
      setSubmitting(true);
      const payload = {
        attemptId,
        answers: Object.entries(selectedAnswers).map(
          ([questionId, answerId]) => ({
            questionId,
            answerId,
          }),
        ),
      };

      const response = await api.post("/quiz/submit-quiz", payload);
      setResult(responseData(response));
    } catch (error) {
      console.error("Submit quiz error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">{t("Quiz unavailable")}</h1>
          <p className="mt-3 text-gray-500">
            {t("This quiz cannot be loaded at the moment.")}
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

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-2xl bg-[#24533e] p-8 text-white shadow-md">
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-100">
            {t("Assessment")}
          </p>
          <h1 className="mt-3 text-3xl font-bold">{quiz.title || "Quiz"}</h1>
        </div>

        {result ? (
          <Card>
            <h2 className="text-2xl font-bold text-gray-900">{t("Quiz result")}</h2>
            <p className="mt-4 text-lg text-gray-700">
              {t("Score")}:{" "}
              <span className="font-bold text-blue-600">
                {result.score ?? 0} ({Math.round(result.percentage ?? 0)}%)
              </span>
            </p>
            <p className="mt-2 text-gray-600">
              {result.passed
                ? t("You passed this quiz.")
                : t("You can try again after review.")}
            </p>
            <Button
              color="blue"
              className="mt-5 w-fit"
              onClick={() => navigate("/courses")}
            >
              {t("Back to courses")}
            </Button>
          </Card>
        ) : (
          <div className="space-y-5">
            {quiz.questions?.map((question, index) => {
              const questionId =
                question._id ??
                question.id ??
                `${quiz._id ?? quiz.id}-question-${index}`;

              return (
                <Card key={questionId}>
                  <h3 className="mb-4 text-xl font-bold text-gray-900">
                    {index + 1}. {question.question || t("Question")}
                  </h3>

                  <div className="space-y-3">
                    {(question.answers ?? []).map((answer) => {
                      const answerId =
                        answer._id ?? answer.id ?? `${questionId}-answer`;

                      return (
                        <label
                          key={answerId}
                          className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-3 transition hover:bg-gray-50"
                        >
                          <Radio
                            name={questionId}
                            checked={selectedAnswers[questionId] === answerId}
                            onChange={() =>
                              handleAnswerChange(questionId, answerId)
                            }
                          />
                          <span className="text-gray-700">
                            {answer.text || t("Answer option")}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </Card>
              );
            })}

            <div className="flex justify-end">
              <Button
                color="blue"
                size="lg"
                disabled={submitting}
                onClick={() => void handleSubmitQuiz()}
              >
                {submitting ? t("Submitting...") : t("Submit quiz")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default QuizPage;

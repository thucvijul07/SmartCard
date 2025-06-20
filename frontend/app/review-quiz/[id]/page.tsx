"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import axiosClient from "@/lib/axiosClient";

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  userAnswer?: number;
};

type QuizResult = {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  score: number;
  totalQuestions: number;
  completedAt: string;
};

export default function ReviewQuizPage() {
  const { id } = useParams();
  const router = useRouter();
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch quiz result from API
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axiosClient
      .get(`/quiz/result/${id}`)
      .then((res) => {
        if (res.data && res.data.isSuccess) {
          setQuizResult(res.data);
        } else {
          setQuizResult(null);
        }
      })
      .catch(() => setQuizResult(null))
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header toggleSidebar={() => setSidebarOpen(true)} />
        <div className="flex flex-1">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 p-6 md:p-10 md:ml-0 transition-all duration-300 ease-in-out">
            <div className="flex min-h-screen flex-col items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">
                  Loading Quiz Results...
                </div>
                <div className="text-muted-foreground">
                  Retrieving your quiz results
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!quizResult) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header toggleSidebar={() => setSidebarOpen(true)} />
        <div className="flex flex-1">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 p-6 md:p-10 md:ml-0 transition-all duration-300 ease-in-out">
            <div className="flex min-h-screen flex-col items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">Results Not Found</div>
                <div className="text-muted-foreground mb-4">
                  The quiz results you're looking for don't exist
                </div>
                <Button onClick={() => router.push("/library")}>
                  Back to Library
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header toggleSidebar={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 md:p-10 md:ml-0 transition-all duration-300 ease-in-out">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push("/library")}
                className="mr-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Library
              </Button>
              <h1 className="text-3xl font-bold">Quiz Results</h1>
            </div>

            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">{quizResult.title}</h2>
                    <p className="text-muted-foreground">
                      {quizResult.description}
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-between gap-4 border-t pt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Completed on
                      </p>
                      <p className="font-medium">
                        {formatDate(quizResult.completedAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Score</p>
                      <p className="font-medium">
                        {quizResult.score} out of {quizResult.totalQuestions} (
                        {Math.round(
                          (quizResult.score / quizResult.totalQuestions) * 100
                        )}
                        %)
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Result</p>
                      <p
                        className={`font-medium ${
                          quizResult.score / quizResult.totalQuestions >= 0.7
                            ? "text-green-600"
                            : "text-amber-600"
                        }`}
                      >
                        {quizResult.score / quizResult.totalQuestions >= 0.7
                          ? "Passed"
                          : "Needs Improvement"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <h3 className="text-xl font-bold">Question Review</h3>
              {quizResult.questions.map((question, index) => (
                <Card
                  key={question.id}
                  className={`border-l-4 ${
                    question.userAnswer === question.correctAnswer
                      ? "border-l-green-500"
                      : "border-l-destructive"
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          question.userAnswer === question.correctAnswer
                            ? "bg-green-500 text-white"
                            : "bg-destructive text-white"
                        }`}
                      >
                        {question.userAnswer === question.correctAnswer ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div className="space-y-4 w-full">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{question.question}</h3>
                          <span className="text-sm text-muted-foreground">
                            Question {index + 1}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div
                            className={`p-3 rounded-md border ${
                              question.userAnswer === question.correctAnswer
                                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                : "border-destructive bg-destructive/10"
                            }`}
                          >
                            <p className="text-sm font-medium mb-1">
                              Your answer:
                            </p>
                            <p>
                              {question.userAnswer !== undefined
                                ? question.options[question.userAnswer]
                                : "No answer"}
                            </p>
                          </div>
                          {question.userAnswer !== question.correctAnswer && (
                            <div className="p-3 rounded-md border border-green-500 bg-green-50 dark:bg-green-900/20">
                              <p className="text-sm font-medium mb-1">
                                Correct answer:
                              </p>
                              <p>{question.options[question.correctAnswer]}</p>
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                          <strong>Explanation:</strong> {question.explanation}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <Button variant="outline" onClick={() => router.push("/library")}>
                Back to Library
              </Button>
              <Button
                onClick={() => router.push(`/take-quiz/${quizResult.id}`)}
              >
                Retake Quiz
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

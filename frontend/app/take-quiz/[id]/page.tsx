"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import axiosClient from "@/lib/axiosClient";

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

type Quiz = {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
};

export default function TakeQuizPage() {
  const { id } = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch quiz data from API
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axiosClient
      .get(`/quiz/set/${id}`)
      .then((res) => {
        if (res.data && res.data.isSuccess && res.data.data) {
          setQuiz(res.data.data);
          setSelectedAnswers(
            new Array(res.data.data.questions.length).fill(-1)
          );
          setTimeRemaining(res.data.data.questions.length * 60); // 60s mỗi câu
        } else {
          setQuiz(null);
        }
      })
      .catch(() => {
        setQuiz(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Timer countdown
  useEffect(() => {
    if (loading || isSubmitted || timeRemaining === null) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [loading, isSubmitted, timeRemaining]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeRemaining === 0 && !isSubmitted) {
      handleSubmitQuiz();
    }
  }, [timeRemaining, isSubmitted]);

  // Update progress
  useEffect(() => {
    if (quiz) {
      setProgress(
        Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)
      );
    }
  }, [currentQuestionIndex, quiz]);

  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitted(true);
    if (quiz) {
      try {
        const answers = quiz.questions.map((q, idx) => ({
          quiz_id: q.id,
          selected_answer:
            selectedAnswers[idx] >= 0 ? q.options[selectedAnswers[idx]] : "",
        }));
        await axiosClient.post("/quiz/submit", {
          quiz_set_id: quiz.id,
          answers,
        });
      } catch (err) {
        console.error("Error submitting quiz:", err);
      }
    }
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    return quiz.questions.reduce((score, question, index) => {
      return (
        score + (selectedAnswers[index] === question.correctAnswer ? 1 : 0)
      );
    }, 0);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
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
                <div className="text-2xl font-bold mb-2">Loading Quiz...</div>
                <div className="text-muted-foreground">Preparing your quiz</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header toggleSidebar={() => setSidebarOpen(true)} />
        <div className="flex flex-1">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 p-6 md:p-10 md:ml-0 transition-all duration-300 ease-in-out">
            <div className="flex min-h-screen flex-col items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">Quiz Not Found</div>
                <div className="text-muted-foreground mb-4">
                  The quiz you're looking for doesn't exist
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
            {!isSubmitted ? (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">{quiz.title}</h1>
                    <p className="text-muted-foreground mt-1">
                      {quiz.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-lg font-medium">
                      Question {currentQuestionIndex + 1} of{" "}
                      {quiz.questions.length}
                    </div>
                    {timeRemaining !== null && (
                      <div
                        className={`text-sm font-medium ${
                          timeRemaining < 60
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        Time remaining: {formatTime(timeRemaining)}
                      </div>
                    )}
                  </div>
                </div>

                <Progress value={progress} className="mb-8" />

                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          {currentQuestionIndex + 1}
                        </div>
                        <h3 className="text-xl font-medium pt-0.5">
                          {quiz.questions[currentQuestionIndex].question}
                        </h3>
                      </div>

                      <RadioGroup
                        value={
                          selectedAnswers[currentQuestionIndex]?.toString() ||
                          ""
                        }
                        onValueChange={(value) =>
                          handleSelectAnswer(
                            currentQuestionIndex,
                            Number.parseInt(value)
                          )
                        }
                        className="space-y-3 mt-4"
                      >
                        {quiz.questions[currentQuestionIndex].options.map(
                          (option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroupItem
                                value={optionIndex.toString()}
                                id={`option-${optionIndex}`}
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor={`option-${optionIndex}`}
                                className="flex flex-1 items-center gap-3 rounded-md border border-muted p-4 hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                              >
                                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-muted-foreground text-muted-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary">
                                  {String.fromCharCode(65 + optionIndex)}
                                </div>
                                <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  {option}
                                </span>
                              </Label>
                            </div>
                          )
                        )}
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex gap-3">
                    {currentQuestionIndex === quiz.questions.length - 1 ? (
                      <Button
                        onClick={handleSubmitQuiz}
                        disabled={selectedAnswers.some(
                          (answer) => answer === -1
                        )}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Submit Quiz
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNextQuestion}
                        disabled={selectedAnswers[currentQuestionIndex] === -1}
                      >
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-2 justify-center">
                  {quiz.questions.map((_, index) => (
                    <Button
                      key={index}
                      variant={
                        currentQuestionIndex === index
                          ? "default"
                          : selectedAnswers[index] >= 0
                          ? "outline"
                          : "ghost"
                      }
                      size="sm"
                      className={`h-8 w-8 p-0 ${
                        selectedAnswers[index] >= 0
                          ? "border-primary text-primary"
                          : "border-muted-foreground text-muted-foreground"
                      }`}
                      onClick={() => setCurrentQuestionIndex(index)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                        <CheckCircle2 className="h-12 w-12" />
                      </div>
                      <h2 className="text-3xl font-bold mb-2">
                        Quiz Completed!
                      </h2>
                      <p className="text-xl mb-2">
                        Your Score: {calculateScore()} out of{" "}
                        {quiz.questions.length}
                      </p>
                      <p className="text-muted-foreground mb-6">
                        {Math.round(
                          (calculateScore() / quiz.questions.length) * 100
                        )}
                        % Correct
                      </p>
                      <div className="flex justify-center gap-4">
                        <Button
                          variant="outline"
                          onClick={() => router.push("/library")}
                        >
                          Back to Library
                        </Button>
                        <Button
                          onClick={() => router.push(`/review-quiz/${quiz.id}`)}
                        >
                          Review Answers
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

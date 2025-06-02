"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

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

export default function TakeQuizPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Simulate fetching quiz data
  useEffect(() => {
    // In a real app, fetch from API based on params.id
    const mockQuiz: Quiz = {
      id: params.id,
      title: "Biology Midterm Quiz",
      description: "Test your knowledge of basic biology concepts",
      questions: [
        {
          id: "q1",
          question: "What is the powerhouse of the cell?",
          options: [
            "Nucleus",
            "Mitochondria",
            "Endoplasmic Reticulum",
            "Golgi Apparatus",
          ],
          correctAnswer: 1,
          explanation:
            "Mitochondria are often referred to as the powerhouse of the cell because they generate most of the cell's supply of ATP, used as a source of chemical energy.",
        },
        {
          id: "q2",
          question: "Which of the following is NOT a function of the liver?",
          options: [
            "Detoxification",
            "Protein synthesis",
            "Bile production",
            "Oxygen transport",
          ],
          correctAnswer: 3,
          explanation:
            "Oxygen transport is primarily a function of red blood cells, not the liver.",
        },
        {
          id: "q3",
          question: "What is the process by which plants make their own food?",
          options: [
            "Respiration",
            "Photosynthesis",
            "Fermentation",
            "Digestion",
          ],
          correctAnswer: 1,
          explanation:
            "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll.",
        },
        {
          id: "q4",
          question: "Which of the following is not a type of blood cell?",
          options: [
            "Red blood cells",
            "White blood cells",
            "Platelets",
            "Nephrons",
          ],
          correctAnswer: 3,
          explanation:
            "Nephrons are the functional units of the kidney, not a type of blood cell.",
        },
        {
          id: "q5",
          question: "What is the largest organ in the human body?",
          options: ["Heart", "Liver", "Skin", "Brain"],
          correctAnswer: 2,
          explanation:
            "The skin is the largest organ in the human body, with a total area of about 20 square feet in adults.",
        },
      ],
    };

    setQuiz(mockQuiz);
    setSelectedAnswers(new Array(mockQuiz.questions.length).fill(-1));
    setTimeRemaining(mockQuiz.questions.length * 1);
    setLoading(false);
  }, [params.id]);

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

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
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

                <div className="space-y-6">
                  <h3 className="text-xl font-bold">Question Summary</h3>
                  {quiz.questions.map((question, index) => (
                    <Card
                      key={question.id}
                      className={`border-l-4 ${
                        selectedAnswers[index] === question.correctAnswer
                          ? "border-l-green-500"
                          : "border-l-destructive"
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                              selectedAnswers[index] === question.correctAnswer
                                ? "bg-green-500 text-white"
                                : "bg-destructive text-white"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div className="space-y-4 w-full">
                            <h3 className="font-medium">{question.question}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div
                                className={`p-3 rounded-md border ${
                                  selectedAnswers[index] ===
                                  question.correctAnswer
                                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                    : "border-destructive bg-destructive/10"
                                }`}
                              >
                                <p className="text-sm font-medium mb-1">
                                  Your answer:
                                </p>
                                <p>
                                  {selectedAnswers[index] >= 0
                                    ? question.options[selectedAnswers[index]]
                                    : "No answer"}
                                </p>
                              </div>
                              {selectedAnswers[index] !==
                                question.correctAnswer && (
                                <div className="p-3 rounded-md border border-green-500 bg-green-50 dark:bg-green-900/20">
                                  <p className="text-sm font-medium mb-1">
                                    Correct answer:
                                  </p>
                                  <p>
                                    {question.options[question.correctAnswer]}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                              <strong>Explanation:</strong>{" "}
                              {question.explanation}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export default function ReviewAIQuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const quizType = searchParams.get("type") || "multiple-choice";
    const titleParam = searchParams.get("title") || "AI Generated Quiz";
    const dataParam = searchParams.get("data");

    let quizQuestions: QuizQuestion[] = [];

    if (dataParam) {
      try {
        const rawQuestions = JSON.parse(decodeURIComponent(dataParam));
        // Convert options object to array if needed
        quizQuestions = rawQuestions.map((q: any, idx: number) => {
          let options = q.options;
          if (!Array.isArray(options) && typeof options === "object") {
            // Convert {A:...,B:...,C:...,D:...} to array
            options = ["A", "B", "C", "D"].map((key) => options[key] || "");
          }
          return {
            id: q.id || `question-${idx + 1}`,
            question: q.question,
            options,
            correctAnswer:
              typeof q.correctAnswer === "string"
                ? ["A", "B", "C", "D"].indexOf(q.correctAnswer)
                : q.correctAnswer,
            explanation: q.explanation || "",
          };
        });
      } catch (e) {
        quizQuestions = [];
      }
    }

    setTitle(titleParam);
    setDescription("Generated from your content using AI");
    setQuestions(quizQuestions);
    setSelectedAnswers(new Array(quizQuestions.length).fill(-1));
    setLoading(false);
  }, [searchParams]);

  const addQuestion = () => {
    const newQuestion = {
      id: `question-${questions.length + 1}`,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
    };
    setQuestions([...questions, newQuestion]);
    setCurrentQuestionIndex(questions.length);

    // Update selected answers array
    setSelectedAnswers([...selectedAnswers, -1]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);

    // Update selected answers array
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers.splice(index, 1);
    setSelectedAnswers(newSelectedAnswers);

    if (currentQuestionIndex >= newQuestions.length) {
      setCurrentQuestionIndex(newQuestions.length - 1);
    }
  };

  const updateQuestion = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newQuestions = [...questions];
    if (field === "question" || field === "explanation") {
      newQuestions[index] = { ...newQuestions[index], [field]: value };
    } else if (field === "correctAnswer") {
      newQuestions[index] = {
        ...newQuestions[index],
        correctAnswer: value as number,
      };
    } else if (field.startsWith("option")) {
      const optionIndex = Number.parseInt(field.split("-")[1]);
      const newOptions = [...newQuestions[index].options];
      newOptions[optionIndex] = value as string;
      newQuestions[index] = { ...newQuestions[index], options: newOptions };
    }
    setQuestions(newQuestions);
  };

  const handleSave = () => {
    // Save logic would go here
    alert("Quiz saved to your library!");
    router.push("/library");
  };

  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    return questions.reduce((score, question, index) => {
      return (
        score + (selectedAnswers[index] === question.correctAnswer ? 1 : 0)
      );
    }, 0);
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
                <div className="text-2xl font-bold mb-2">Loading...</div>
                <div className="text-muted-foreground">
                  Loading AI-generated quiz
                </div>
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
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/ai-quiz-generator")}
                  className="mr-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to AI Quiz Generator
                </Button>
                <h1 className="text-3xl font-bold">Review AI Quiz</h1>
              </div>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save to Library
              </Button>
            </div>

            <div className="mb-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Biology Quiz"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add a description for your quiz"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "edit" | "preview")
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="edit">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setCurrentQuestionIndex(
                            Math.max(0, currentQuestionIndex - 1)
                          )
                        }
                        disabled={currentQuestionIndex === 0}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setCurrentQuestionIndex(
                            Math.min(
                              questions.length - 1,
                              currentQuestionIndex + 1
                            )
                          )
                        }
                        disabled={currentQuestionIndex === questions.length - 1}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Card>
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="question">Question</Label>
                        <Textarea
                          id="question"
                          placeholder="Enter question"
                          value={
                            questions[currentQuestionIndex]?.question || ""
                          }
                          onChange={(e) =>
                            updateQuestion(
                              currentQuestionIndex,
                              "question",
                              e.target.value
                            )
                          }
                          rows={2}
                        />
                      </div>

                      <div className="space-y-4">
                        <Label>Answer Options</Label>
                        {Array.isArray(
                          questions[currentQuestionIndex]?.options
                        ) &&
                          questions[currentQuestionIndex].options.map(
                            (option, optionIndex) => (
                              <div key={optionIndex}>
                                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-muted-foreground text-muted-foreground">
                                  {String.fromCharCode(65 + optionIndex)}
                                </div>
                                <Input
                                  placeholder={`Option ${String.fromCharCode(
                                    65 + optionIndex
                                  )}`}
                                  value={option}
                                  onChange={(e) =>
                                    updateQuestion(
                                      currentQuestionIndex,
                                      `option-${optionIndex}`,
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            )
                          )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="correct-answer">Correct Answer</Label>
                        <Select
                          value={questions[
                            currentQuestionIndex
                          ]?.correctAnswer.toString()}
                          onValueChange={(value) =>
                            updateQuestion(
                              currentQuestionIndex,
                              "correctAnswer",
                              Number.parseInt(value)
                            )
                          }
                        >
                          <SelectTrigger id="correct-answer">
                            <SelectValue placeholder="Select correct answer" />
                          </SelectTrigger>
                          <SelectContent>
                            {questions[currentQuestionIndex]?.options.map(
                              (option, optionIndex) => (
                                <SelectItem
                                  key={optionIndex}
                                  value={optionIndex.toString()}
                                >
                                  Option {String.fromCharCode(65 + optionIndex)}
                                  :{" "}
                                  {option ||
                                    `(empty option ${optionIndex + 1})`}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="explanation">
                          Explanation (optional)
                        </Label>
                        <Textarea
                          id="explanation"
                          placeholder="Explain why this answer is correct"
                          value={
                            questions[currentQuestionIndex]?.explanation || ""
                          }
                          onChange={(e) =>
                            updateQuestion(
                              currentQuestionIndex,
                              "explanation",
                              e.target.value
                            )
                          }
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => removeQuestion(currentQuestionIndex)}
                      disabled={questions.length <= 1}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Question
                    </Button>
                    <Button onClick={addQuestion}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Question
                    </Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="preview">
                {!showResults ? (
                  <div className="space-y-6">
                    <div className="text-center mb-4">
                      <h2 className="text-2xl font-bold">
                        {title || "Untitled Quiz"}
                      </h2>
                      {description && (
                        <p className="text-muted-foreground mt-2">
                          {description}
                        </p>
                      )}
                    </div>

                    <Card>
                      <CardContent className="p-6">
                        <div className="space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              {currentQuestionIndex + 1}
                            </div>
                            <h3 className="font-medium text-lg">
                              {questions[currentQuestionIndex].question}
                            </h3>
                          </div>

                          <RadioGroup
                            value={
                              selectedAnswers[
                                currentQuestionIndex
                              ]?.toString() || ""
                            }
                            onValueChange={(value) =>
                              handleSelectAnswer(
                                currentQuestionIndex,
                                Number.parseInt(value)
                              )
                            }
                            className="space-y-3"
                          >
                            {questions[currentQuestionIndex].options.map(
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

                          <div className="flex justify-between pt-4">
                            <Button
                              variant="outline"
                              onClick={handlePrevQuestion}
                              disabled={currentQuestionIndex === 0}
                            >
                              Previous
                            </Button>
                            <Button
                              onClick={handleNextQuestion}
                              disabled={
                                selectedAnswers[currentQuestionIndex] === -1
                              }
                            >
                              {currentQuestionIndex === questions.length - 1
                                ? "Finish"
                                : "Next"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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
                          <p className="text-muted-foreground mb-6">
                            You scored {calculateScore()} out of{" "}
                            {questions.length} questions correctly.
                          </p>
                          <div className="flex justify-center gap-4">
                            <Button
                              variant="outline"
                              onClick={() => setShowResults(false)}
                            >
                              Review Questions
                            </Button>
                            <Button onClick={handleSave}>Save Quiz</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-6">
                      <h3 className="text-xl font-bold">Question Summary</h3>
                      {questions.map((question, index) => (
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
                                  selectedAnswers[index] ===
                                  question.correctAnswer
                                    ? "bg-green-500 text-white"
                                    : "bg-destructive text-white"
                                }`}
                              >
                                {index + 1}
                              </div>
                              <div className="space-y-4 w-full">
                                <h3 className="font-medium">
                                  {question.question}
                                </h3>
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
                                        ? question.options[
                                            selectedAnswers[index]
                                          ]
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
                                        {
                                          question.options[
                                            question.correctAnswer
                                          ]
                                        }
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
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

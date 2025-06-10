"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Save, ArrowRight } from "lucide-react";
import axios from "@/lib/axiosClient";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export default function EditQuizPage() {
  const { id } = useParams();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/quiz/edit-set/${id}`);
        const data = res.data?.data;
        if (data) {
          setTitle(data.title || "");
          setDescription(data.description || "");
          setQuestions(data.questions || []);
        }
      } catch (e) {
        toast.error("Failed to load quiz data. Please try again.");
        console.error(e);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const addQuestion = () => {
    const newQuestion = {
      id: `new-${Date.now()}`,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
    };
    setQuestions([...questions, newQuestion]);
    setCurrentQuestionIndex(questions.length);
  };

  const removeQuestion = async (index: number) => {
    if (questions.length <= 1) return;
    const question = questions[index];
    const newQuestions = [...questions];
    if (question.id && !question.id.startsWith("new-")) {
      try {
        await axios.delete(`/quiz/${question.id}`);
        toast.success("Question deleted successfully.");
      } catch (e) {
        console.error(e);
        toast.error("Failed to delete question. Please try again.");
      }
    }
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
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

  const handleSave = async () => {
    try {
      await axios.put(`/quiz/set/${id}`, {
        title,
        description,
        questions: questions.map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options,
          correct_answer: q.options[q.correctAnswer],
          explanation: q.explanation,
        })),
      });
      toast.success("Quiz saved successfully!");
      router.push("/library");
    } catch (e) {
      toast.error("Failed to save quiz. Please try again.");
      console.error(e);
    }
  };

  const handleDeleteClick = (index: number) => {
    setPendingDeleteIndex(index);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (pendingDeleteIndex !== null) {
      await removeQuestion(pendingDeleteIndex);
      setPendingDeleteIndex(null);
      setConfirmOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setPendingDeleteIndex(null);
    setConfirmOpen(false);
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
                <div className="text-muted-foreground">Loading quiz</div>
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
                  onClick={() => router.push("/library")}
                  className="mr-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Library
                </Button>
                <h1 className="text-3xl font-bold">Edit Quiz</h1>
              </div>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>

            <div className="mb-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Biology Midterm"
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
                        Math.min(questions.length - 1, currentQuestionIndex + 1)
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
                      value={questions[currentQuestionIndex]?.question || ""}
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
                    {questions[currentQuestionIndex]?.options.map(
                      (option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="flex items-center gap-3"
                        >
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
                              Option {String.fromCharCode(65 + optionIndex)}:{" "}
                              {option || `(empty option ${optionIndex + 1})`}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="explanation">Explanation (optional)</Label>
                    <Textarea
                      id="explanation"
                      placeholder="Explain why this answer is correct"
                      value={questions[currentQuestionIndex]?.explanation || ""}
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
                  onClick={() => handleDeleteClick(currentQuestionIndex)}
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
          </div>
        </main>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Question"
        description="Are you sure you want to delete this question? This action cannot be undone."
      />
    </div>
  );
}

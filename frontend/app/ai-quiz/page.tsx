"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BrainCircuit, FileText, Upload, Loader2 } from "lucide-react";
import axiosClient from "@/lib/axiosClient";

export default function AIQuizPage() {
  const router = useRouter();
  const [inputMethod, setInputMethod] = useState<"text" | "upload" | "url">(
    "text"
  );
  const [inputText, setInputText] = useState("");
  const [title, setTitle] = useState("");
  const [numQuestions, setNumQuestions] = useState([5]);
  const [difficulty, setDifficulty] = useState("medium");
  const [quizType, setQuizType] = useState("multiple-choice");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentView, setCurrentView] = useState<"create" | "preview" | "take">(
    "create"
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    setIsGenerating(true);
    try {
      const response = await axiosClient.post("/quiz/generateQuiz", {
        text: inputText,
        numQA: numQuestions[0],
        difficulty,
      });

      // Chuyển đổi dữ liệu quiz về đúng format cho trang review
      const quizzes = (response.data.quizzes || []).map(
        (q: any, idx: number) => {
          const optionKeys = ["A", "B", "C", "D"];
          // Đảm bảo q.options là object, nếu không thì trả về mảng rỗng
          const optionsArray =
            q.options && typeof q.options === "object"
              ? optionKeys.map((key) => q.options[key] || "")
              : ["", "", "", ""];
          const correctIndex = optionKeys.indexOf(q.correctAnswer);
          return {
            id: `question-${idx + 1}`,
            question: q.question,
            options: optionsArray,
            correctAnswer: correctIndex,
            explanation: q.explanation,
          };
        }
      );

      router.push(
        `/review-ai-quiz?title=${encodeURIComponent(
          title || "AI Generated Quiz"
        )}&type=${quizType}&data=${encodeURIComponent(JSON.stringify(quizzes))}`
      );
    } catch (error) {
      alert("An error occurred while generating quiz.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header toggleSidebar={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 md:p-10 md:ml-0 transition-all duration-300 ease-in-out">
          <div className="mx-auto max-w-5xl">
            {currentView === "create" && (
              <>
                <div className="mb-6">
                  <h1 className="text-3xl font-bold">AI Quiz Generator</h1>
                  <p className="text-muted-foreground mt-2">
                    Generate quizzes from your notes, textbooks, or any text
                    using our advanced AI
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BrainCircuit className="h-5 w-5 text-primary" />
                          Input Content
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Tabs
                          value={inputMethod}
                          onValueChange={(v) => setInputMethod(v as any)}
                          className="w-full"
                        >
                          <TabsList className="grid w-full grid-cols-3 mb-4">
                            <TabsTrigger
                              value="text"
                              className="flex items-center gap-2"
                            >
                              <FileText className="h-4 w-4" />
                              <span>Text</span>
                            </TabsTrigger>
                            <TabsTrigger
                              value="upload"
                              className="flex items-center gap-2"
                            >
                              <Upload className="h-4 w-4" />
                              <span>Upload</span>
                            </TabsTrigger>
                            <TabsTrigger
                              value="url"
                              className="flex items-center gap-2"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                              >
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                              </svg>
                              <span>URL</span>
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="text">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="title">Title (optional)</Label>
                                <Input
                                  id="title"
                                  placeholder="e.g., Biology Chapter 5 Quiz"
                                  value={title}
                                  onChange={(e) => setTitle(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="content">
                                  Paste your content
                                </Label>
                                <Textarea
                                  id="content"
                                  placeholder="Paste your notes, textbook content, or any text you want to convert to quiz questions..."
                                  value={inputText}
                                  onChange={(e) => setInputText(e.target.value)}
                                  rows={12}
                                  className="resize-none"
                                />
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="upload">
                            <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md border-muted-foreground/25 p-4">
                              <div className="text-center">
                                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">
                                  Upload a file
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                  Drag and drop or click to upload PDF, DOCX, or
                                  TXT files
                                </p>
                                <Button variant="outline">Select File</Button>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="url">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="url">Enter URL</Label>
                                <Input
                                  id="url"
                                  placeholder="https://example.com/article"
                                />
                              </div>
                              <Button variant="outline">Fetch Content</Button>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Quiz Options</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="num-questions">
                            Number of questions ({numQuestions[0]})
                          </Label>
                          <Slider
                            id="num-questions"
                            min={3}
                            max={20}
                            step={1}
                            value={numQuestions}
                            onValueChange={setNumQuestions}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="difficulty">Difficulty level</Label>
                          <Select
                            value={difficulty}
                            onValueChange={setDifficulty}
                          >
                            <SelectTrigger id="difficulty">
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="quiz-type">Quiz type</Label>
                          <Select value={quizType} onValueChange={setQuizType}>
                            <SelectTrigger id="quiz-type">
                              <SelectValue placeholder="Select quiz type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple-choice">
                                Multiple Choice
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full"
                          onClick={handleGenerate}
                          disabled={!inputText.trim() || isGenerating}
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <BrainCircuit className="mr-2 h-4 w-4" />
                              Generate Quiz
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

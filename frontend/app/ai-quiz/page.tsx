"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
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
import { BrainCircuit, FileText, Cpu, Loader2 } from "lucide-react";
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
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [textLength, setTextLength] = useState([500]);
  const [gradeLevel, setGradeLevel] = useState("middle");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("english");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleGenerateAIText = async () => {
    if (!topic) {
      toast.error("Please enter a topic");
      return;
    }

    setIsGeneratingText(true);

    try {
      const response = await axiosClient.post("/openai/generate-text", {
        topic,
        textLength: textLength[0],
        gradeLevel,
        language,
      });

      const generatedText = response.data.text;
      setInputText(generatedText);

      toast.success(
        "Text generated successfully! Check the Text tab to review and edit before generating flashcards."
      );
      setInputMethod("text");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while generating text. Please try again.");
    } finally {
      setIsGeneratingText(false);
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to generate a quiz.");
      return;
    }

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
  const isGenerateDisabled = !inputText.trim(); // Disable generate button if no input
  const isGenerateTextDisabled = !topic.trim();

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
                          <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger
                              value="text"
                              className="flex items-center gap-2"
                            >
                              <FileText className="h-4 w-4" />
                              <span>Text</span>
                            </TabsTrigger>
                            <TabsTrigger
                              value="ai"
                              className="flex items-center gap-2"
                            >
                              <Cpu className="h-4 w-4" />
                              <span>Generate Text</span>
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
                                  disabled={isGenerating}
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
                                  disabled={isGenerating}
                                />
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="ai">
                            <div className="space-y-6">
                              <div className="space-y-2">
                                <Label htmlFor="topic">Topic</Label>
                                <Input
                                  id="topic"
                                  placeholder="e.g., Photosynthesis, World War II, Quantum Physics"
                                  value={topic}
                                  onChange={(e) => setTopic(e.target.value)}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="text-length">
                                  Text Length ({textLength[0]} words)
                                </Label>
                                <Slider
                                  id="text-length"
                                  min={100}
                                  max={2000}
                                  step={100}
                                  value={textLength}
                                  onValueChange={setTextLength}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="grade-level">Grade Level</Label>
                                <Select
                                  value={gradeLevel}
                                  onValueChange={setGradeLevel}
                                >
                                  <SelectTrigger id="grade-level">
                                    <SelectValue placeholder="Select grade level" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="elementary">
                                      Elementary School
                                    </SelectItem>
                                    <SelectItem value="middle">
                                      Middle School
                                    </SelectItem>
                                    <SelectItem value="high">
                                      High School
                                    </SelectItem>
                                    <SelectItem value="college">
                                      College
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="language">Language</Label>
                                <Select
                                  value={language}
                                  onValueChange={setLanguage}
                                >
                                  <SelectTrigger id="language">
                                    <SelectValue placeholder="Select language" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="english">
                                      English
                                    </SelectItem>
                                    <SelectItem value="vietnamese">
                                      Vietnamese
                                    </SelectItem>
                                    <SelectItem value="spanish">
                                      Spanish
                                    </SelectItem>
                                    <SelectItem value="french">
                                      French
                                    </SelectItem>
                                    <SelectItem value="chinese">
                                      Chinese
                                    </SelectItem>
                                    <SelectItem value="japanese">
                                      Japanese
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <Button
                                className="w-full"
                                onClick={handleGenerateAIText}
                                disabled={
                                  isGenerateTextDisabled || isGeneratingText
                                }
                              >
                                {isGeneratingText ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating Text...
                                  </>
                                ) : (
                                  <>
                                    <Cpu className="mr-2 h-4 w-4" />
                                    Generate Text
                                  </>
                                )}
                              </Button>
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
                            disabled={isGenerating}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="difficulty">Difficulty level</Label>
                          <Select
                            value={difficulty}
                            onValueChange={setDifficulty}
                            disabled={isGenerating}
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
                          <Select
                            value={quizType}
                            onValueChange={setQuizType}
                            disabled={isGenerating}
                          >
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
          <ToastContainer position="top-right" autoClose={3000} />
        </main>
      </div>
    </div>
  );
}

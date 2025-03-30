"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { BrainCircuit, FileText, Upload, Loader2, CheckCircle2 } from "lucide-react"

type QuizQuestion = {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export default function AIQuizPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [inputMethod, setInputMethod] = useState<"text" | "upload" | "url">("text")
  const [inputText, setInputText] = useState("")
  const [title, setTitle] = useState("")
  const [numQuestions, setNumQuestions] = useState([5])
  const [difficulty, setDifficulty] = useState("medium")
  const [quizType, setQuizType] = useState("multiple-choice")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuiz, setGeneratedQuiz] = useState<QuizQuestion[]>([])
  const [currentView, setCurrentView] = useState<"create" | "preview" | "take">("create")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)

  const handleGenerate = () => {
    if (!inputText.trim()) return

    setIsGenerating(true)

    // Simulate API call with timeout
    setTimeout(() => {
      // Mock generated quiz questions
      const mockQuestions: QuizQuestion[] = Array.from({ length: numQuestions[0] }, (_, i) => ({
        id: `question-${i + 1}`,
        question: `Generated question ${i + 1} about the topic?`,
        options: [
          `Option A for question ${i + 1}`,
          `Option B for question ${i + 1}`,
          `Option C for question ${i + 1}`,
          `Option D for question ${i + 1}`,
        ],
        correctAnswer: Math.floor(Math.random() * 4),
        explanation: `This is the explanation for question ${i + 1}. The correct answer is based on the content you provided.`,
      }))

      setGeneratedQuiz(mockQuestions)
      setSelectedAnswers(new Array(mockQuestions.length).fill(-1))
      setIsGenerating(false)
      setCurrentView("preview")
    }, 2000)
  }

  const handleSave = () => {
    alert("Quiz saved to your library!")
    router.push("/dashboard")
  }

  const handleStartQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswers(new Array(generatedQuiz.length).fill(-1))
    setShowResults(false)
    setCurrentView("take")
  }

  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[questionIndex] = optionIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < generatedQuiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setShowResults(true)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const calculateScore = () => {
    return generatedQuiz.reduce((score, question, index) => {
      return score + (selectedAnswers[index] === question.correctAnswer ? 1 : 0)
    }, 0)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header toggleSidebar={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 md:p-10">
          <div className="mx-auto max-w-5xl">
            {currentView === "create" && (
              <>
                <div className="mb-6">
                  <h1 className="text-3xl font-bold">AI Quiz Generator</h1>
                  <p className="text-muted-foreground mt-2">
                    Generate quizzes from your notes, textbooks, or any text using our advanced AI
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
                        <Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v as any)} className="w-full">
                          <TabsList className="grid w-full grid-cols-3 mb-4">
                            <TabsTrigger value="text" className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>Text</span>
                            </TabsTrigger>
                            <TabsTrigger value="upload" className="flex items-center gap-2">
                              <Upload className="h-4 w-4" />
                              <span>Upload</span>
                            </TabsTrigger>
                            <TabsTrigger value="url" className="flex items-center gap-2">
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
                                <Label htmlFor="content">Paste your content</Label>
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
                                <h3 className="text-lg font-medium mb-2">Upload a file</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                  Drag and drop or click to upload PDF, DOCX, or TXT files
                                </p>
                                <Button variant="outline">Select File</Button>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="url">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="url">Enter URL</Label>
                                <Input id="url" placeholder="https://example.com/article" />
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
                          <Label htmlFor="num-questions">Number of questions ({numQuestions[0]})</Label>
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
                          <Select value={difficulty} onValueChange={setDifficulty}>
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
                              <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                              <SelectItem value="true-false">True/False</SelectItem>
                              <SelectItem value="fill-in-blank">Fill in the Blank</SelectItem>
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

            {currentView === "preview" && generatedQuiz.length > 0 && (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">{title || "Generated Quiz"}</h1>
                    <p className="text-muted-foreground mt-2">
                      {generatedQuiz.length} questions • {difficulty} difficulty
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setCurrentView("create")}>
                      Edit
                    </Button>
                    <Button onClick={handleStartQuiz}>Take Quiz</Button>
                    <Button variant="secondary" onClick={handleSave}>
                      Save to Library
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  {generatedQuiz.map((question, index) => (
                    <Card key={question.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            {index + 1}
                          </div>
                          <div className="space-y-4 w-full">
                            <h3 className="font-medium text-lg">{question.question}</h3>
                            <div className="space-y-2">
                              {question.options.map((option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  className={`p-3 rounded-md border ${
                                    optionIndex === question.correctAnswer
                                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                      : "border-border"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                                        optionIndex === question.correctAnswer
                                          ? "border-green-500 text-green-500"
                                          : "border-muted-foreground text-muted-foreground"
                                      }`}
                                    >
                                      {String.fromCharCode(65 + optionIndex)}
                                    </div>
                                    <span>{option}</span>
                                    {optionIndex === question.correctAnswer && (
                                      <CheckCircle2 className="ml-auto h-5 w-5 text-green-500" />
                                    )}
                                  </div>
                                </div>
                              ))}
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
              </>
            )}

            {currentView === "take" && generatedQuiz.length > 0 && (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">{title || "Quiz"}</h1>
                    <p className="text-muted-foreground mt-2">
                      Question {currentQuestionIndex + 1} of {generatedQuiz.length}
                    </p>
                  </div>
                  {!showResults && (
                    <Button variant="outline" onClick={() => setCurrentView("preview")}>
                      Exit Quiz
                    </Button>
                  )}
                </div>

                {!showResults ? (
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            {currentQuestionIndex + 1}
                          </div>
                          <h3 className="font-medium text-lg">{generatedQuiz[currentQuestionIndex].question}</h3>
                        </div>

                        <RadioGroup
                          value={selectedAnswers[currentQuestionIndex]?.toString() || ""}
                          onValueChange={(value) => handleSelectAnswer(currentQuestionIndex, Number.parseInt(value))}
                          className="space-y-3"
                        >
                          {generatedQuiz[currentQuestionIndex].options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
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
                          ))}
                        </RadioGroup>

                        <div className="flex justify-between pt-4">
                          <Button variant="outline" onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0}>
                            Previous
                          </Button>
                          <Button onClick={handleNextQuestion} disabled={selectedAnswers[currentQuestionIndex] === -1}>
                            {currentQuestionIndex === generatedQuiz.length - 1 ? "Finish" : "Next"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-8">
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-center py-8">
                          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                            <CheckCircle2 className="h-12 w-12" />
                          </div>
                          <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
                          <p className="text-muted-foreground mb-6">
                            You scored {calculateScore()} out of {generatedQuiz.length} questions correctly.
                          </p>
                          <div className="flex justify-center gap-4">
                            <Button variant="outline" onClick={() => setCurrentView("preview")}>
                              Review Answers
                            </Button>
                            <Button onClick={handleSave}>Save Results</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-6">
                      <h3 className="text-xl font-bold">Question Summary</h3>
                      {generatedQuiz.map((question, index) => (
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
                                      selectedAnswers[index] === question.correctAnswer
                                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                        : "border-destructive bg-destructive/10"
                                    }`}
                                  >
                                    <p className="text-sm font-medium mb-1">Your answer:</p>
                                    <p>
                                      {selectedAnswers[index] >= 0
                                        ? question.options[selectedAnswers[index]]
                                        : "No answer"}
                                    </p>
                                  </div>
                                  {selectedAnswers[index] !== question.correctAnswer && (
                                    <div className="p-3 rounded-md border border-green-500 bg-green-50 dark:bg-green-900/20">
                                      <p className="text-sm font-medium mb-1">Correct answer:</p>
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
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}


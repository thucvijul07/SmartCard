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
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, FileText, Upload, ArrowRight, Loader2 } from "lucide-react"

export default function AIFlashcardPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [inputMethod, setInputMethod] = useState<"text" | "upload" | "url">("text")
  const [inputText, setInputText] = useState("")
  const [title, setTitle] = useState("")
  const [numCards, setNumCards] = useState([10])
  const [difficulty, setDifficulty] = useState("medium")
  const [includeImages, setIncludeImages] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCards, setGeneratedCards] = useState<any[]>([])

  const handleGenerate = () => {
    if (!inputText.trim()) return

    setIsGenerating(true)

    // Simulate API call with timeout
    setTimeout(() => {
      // Mock generated flashcards
      const mockCards = Array.from({ length: numCards[0] }, (_, i) => ({
        id: `card-${i + 1}`,
        term: `Generated Term ${i + 1}`,
        definition: `This is a generated definition for term ${i + 1} based on the input text. The difficulty level is set to ${difficulty}.`,
        image: includeImages ? `/placeholder.svg?height=150&width=250` : null,
      }))

      setGeneratedCards(mockCards)
      setIsGenerating(false)
    }, 2000)
  }

  const handleSave = () => {
    alert("Flashcards saved to your library!")
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header toggleSidebar={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 md:p-10">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">AI Flashcard Generator</h1>
              <p className="text-muted-foreground mt-2">
                Generate flashcards from your notes, textbooks, or any text using our advanced AI
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
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
                              placeholder="e.g., Biology Chapter 5"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="content">Paste your content</Label>
                            <Textarea
                              id="content"
                              placeholder="Paste your notes, textbook content, or any text you want to convert to flashcards..."
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
                    <CardTitle>Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="num-cards">Number of cards ({numCards[0]})</Label>
                      <Slider id="num-cards" min={5} max={50} step={5} value={numCards} onValueChange={setNumCards} />
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

                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-images">Include images</Label>
                      <Switch id="include-images" checked={includeImages} onCheckedChange={setIncludeImages} />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={handleGenerate} disabled={!inputText.trim() || isGenerating}>
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Flashcards
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>

            {generatedCards.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Generated Flashcards</h2>
                  <Button onClick={handleSave}>
                    Save to Library
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generatedCards.map((card) => (
                    <Card key={card.id} className="overflow-hidden">
                      {card.image && (
                        <div className="h-40 bg-muted">
                          <img
                            src={card.image || "/placeholder.svg"}
                            alt={card.term}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className={`p-4 ${card.image ? "pt-3" : "pt-4"}`}>
                        <h3 className="font-medium text-lg mb-2">{card.term}</h3>
                        <p className="text-sm text-muted-foreground">{card.definition}</p>
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
  )
}


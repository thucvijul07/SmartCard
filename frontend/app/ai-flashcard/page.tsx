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
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, FileText, Upload, Loader2 } from "lucide-react";
import axiosClient from "@/lib/axiosClient";

export default function AIFlashcardPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputMethod, setInputMethod] = useState<"text" | "upload" | "url">(
    "text"
  );
  const [inputText, setInputText] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [numCards, setNumCards] = useState([10]);
  const [difficulty, setDifficulty] = useState("medium");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setInputText(""); // Clear text input when a file is selected
  };

  const handleFileRead = async () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      setInputText(text);
    };
    reader.readAsText(file);
  };

  const handleGenerate = async () => {
    if (!inputText.trim() && !file) return; // Ensure either text or file is provided

    setIsGenerating(true);

    try {
      const response = await axiosClient.post("/cards/generate", {
        text: inputText,
        numCards: numCards[0],
        difficulty,
      });

      router.push(
        `/review-ai-flashcards?flashcards=${encodeURIComponent(
          JSON.stringify(response.data.flashcards)
        )}&title=${encodeURIComponent(title || "AI Generated Flashcards")}`
      );
    } catch (error) {
      console.error(error);
      alert("An error occurred while generating flashcards.");
    } finally {
      setIsGenerating(false);
    }
  };

  const isGenerateDisabled = !inputText.trim() && !file; // Disable generate button if no input

  return (
    <div className="flex min-h-screen flex-col">
      <Header toggleSidebar={() => setSidebarOpen(false)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 md:p-10 md:ml-0 transition-all duration-300 ease-in-out">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">AI Flashcard Generator</h1>
              <p className="text-muted-foreground mt-2">
                Generate flashcards from your notes, textbooks, or any text
                using our advanced AI
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
                          value="upload"
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Upload</span>
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
                            <h3 className="text-lg font-medium mb-2">
                              Upload a file
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              Drag and drop or click to upload TXT files
                              (PDF/DOCX not supported here)
                            </p>

                            <Input
                              type="file"
                              accept=".txt"
                              onChange={(e) => {
                                handleFileChange(e);
                                handleFileRead(); // Gọi ngay khi file được chọn
                              }}
                              className="w-full cursor-pointer"
                            />

                            {file && (
                              <p className="text-sm text-muted-foreground mt-2">
                                Selected file:{" "}
                                <span className="font-medium">{file.name}</span>
                              </p>
                            )}
                          </div>
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
                      <Label htmlFor="num-cards">
                        Number of cards ({numCards[0]})
                      </Label>
                      <Slider
                        id="num-cards"
                        min={1}
                        max={20}
                        step={1}
                        value={numCards}
                        onValueChange={setNumCards}
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
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={handleGenerate}
                      disabled={isGenerateDisabled || isGenerating}
                    >
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
          </div>
        </main>
      </div>
    </div>
  );
}

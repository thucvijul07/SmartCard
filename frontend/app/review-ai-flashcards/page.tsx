"use client";

import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import axiosClient from "@/lib/axiosClient";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Trash2, Save, ArrowRight } from "lucide-react";

type FlashCard = {
  id: string;
  answer: string;
  question: string;
};

export default function ReviewAIFlashcardsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const flashcardsParam = searchParams.get("flashcards");
    const titleParam = searchParams.get("title");

    if (flashcardsParam) {
      setCards(JSON.parse(flashcardsParam));
    }

    if (titleParam) {
      setTitle(titleParam);
    }
    setLoading(false);
  }, [searchParams]);

  const addCard = () => {
    const newCard = {
      id: `${cards.length + 1}`,
      question: "",
      answer: "",
    };
    setCards([...cards, newCard]);
    setCurrentCardIndex(cards.length);
  };

  const removeCard = (index: number) => {
    if (cards.length <= 1) return;
    const newCards = [...cards];
    newCards.splice(index, 1);
    setCards(newCards);
    if (currentCardIndex >= newCards.length) {
      setCurrentCardIndex(newCards.length - 1);
    }
  };

  const updateCard = (
    index: number,
    field: "term" | "definition",
    value: string
  ) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setCards(newCards);
  };

  const handleSave = async () => {
    try {
      const response = await axiosClient.post("/decks", {
        name: title,
        description,
        cards: cards.map((card) => ({
          question: card.question,
          answer: card.answer,
        })),
      });

      toast.success("Bộ thẻ đã được lưu thành công!");
      router.push("/library");
    } catch (error) {
      console.error("Lỗi lưu bộ thẻ", error);
      toast.error("Lỗi lưu bộ thẻ. Vui lòng thử lại.");
    }
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
                  Loading AI-generated flashcards
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
                  onClick={() => router.push("/ai-flashcard")}
                  className="mr-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to AI Flashcard
                </Button>
                <h1 className="text-3xl font-bold">Review AI Flashcards</h1>
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
                  placeholder="e.g., Biology 101"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add a description for your flashcard set"
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
                      Card {currentCardIndex + 1} of {cards.length}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setCurrentCardIndex(Math.max(0, currentCardIndex - 1))
                        }
                        disabled={currentCardIndex === 0}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setCurrentCardIndex(
                            Math.min(cards.length - 1, currentCardIndex + 1)
                          )
                        }
                        disabled={currentCardIndex === cards.length - 1}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="term">Term</Label>
                        <Textarea
                          id="term"
                          placeholder="Enter term"
                          value={cards[currentCardIndex]?.question || ""}
                          onChange={(e) =>
                            updateCard(currentCardIndex, "term", e.target.value)
                          }
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="definition">Definition</Label>
                        <Textarea
                          id="definition"
                          placeholder="Enter definition"
                          value={cards[currentCardIndex]?.answer || ""}
                          onChange={(e) =>
                            updateCard(
                              currentCardIndex,
                              "definition",
                              e.target.value
                            )
                          }
                          rows={4}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => removeCard(currentCardIndex)}
                      disabled={cards.length <= 1}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Card
                    </Button>
                    <Button onClick={addCard}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Card
                    </Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="preview">
                <div className="space-y-6">
                  <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold">
                      {title || "Untitled Flashcard Set"}
                    </h2>
                    {description && (
                      <p className="text-muted-foreground mt-2">
                        {description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-muted-foreground">
                      Card {currentCardIndex + 1} of {cards.length}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setCurrentCardIndex(Math.max(0, currentCardIndex - 1))
                        }
                        disabled={currentCardIndex === 0}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setCurrentCardIndex(
                            Math.min(cards.length - 1, currentCardIndex + 1)
                          )
                        }
                        disabled={currentCardIndex === cards.length - 1}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Card className="w-full max-w-md h-64 perspective">
                      <div className="relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer flip-card">
                        <div className="absolute inset-0 flex items-center justify-center p-6 backface-hidden bg-card rounded-lg border">
                          <div className="text-xl font-medium text-center">
                            {cards[currentCardIndex]?.question || "Term"}
                          </div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center p-6 backface-hidden bg-card rounded-lg border rotate-y-180">
                          <div className="text-lg text-center">
                            {cards[currentCardIndex]?.answer || "Definition"}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    Click on the card to flip it
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <ToastContainer position="top-right" autoClose={3000} />
        </main>
      </div>
    </div>
  );
}

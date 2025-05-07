"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, Save, ArrowRight } from "lucide-react";

type FlashCard = {
  id: string;
  term: string;
  definition: string;
};

export default function EditFlashcardPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const mockFlashcardSet = {
      id: params.id,
      title: "Biology 101",
      description: "Basic biology concepts and definitions",
      cards: [
        {
          id: "1",
          term: "Photosynthesis",
          definition:
            "The process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll.",
        },
        {
          id: "2",
          term: "Mitochondria",
          definition:
            "Organelles found in large numbers in most cells, in which the biochemical processes of respiration and energy production occur.",
        },
        {
          id: "3",
          term: "Cellular Respiration",
          definition:
            "The process by which cells break down glucose and other molecules to generate ATP, releasing carbon dioxide and water as byproducts.",
        },
      ],
    };

    setTitle(mockFlashcardSet.title);
    setDescription(mockFlashcardSet.description);
    setCards(mockFlashcardSet.cards);
    setLoading(false);
  }, [params.id]);

  const addCard = () => {
    const newCard = {
      id: `${cards.length + 1}`,
      term: "",
      definition: "",
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

  const handleSave = () => {
    alert("Flashcard set saved!");
    router.push("/library");
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
                  Loading flashcard set
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
                  onClick={() => router.push("/library")}
                  className="mr-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Library
                </Button>
                <h1 className="text-3xl font-bold">Edit Flashcard Set</h1>
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
                      value={cards[currentCardIndex]?.term || ""}
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
                      value={cards[currentCardIndex]?.definition || ""}
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
          </div>
        </main>
      </div>
    </div>
  );
}

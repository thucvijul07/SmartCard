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
import { ArrowLeft, Plus, Trash2, Save, ArrowRight } from "lucide-react";
import axios from "@/lib/axiosClient";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type FlashCard = {
  _id: string;
  term: string;
  definition: string;
};

export default function EditFlashcardPage() {
  const { id } = useParams();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/cards/by-deck/${id}`);
        const backendData = res.data;
        if (backendData.title) setTitle(backendData.title);
        if (backendData.description) setDescription(backendData.description);
        if (backendData.cards) {
          setCards(
            backendData.cards.map((c: any) => ({
              _id: c._id,
              term: c.question,
              definition: c.answer,
            }))
          );
        } else if (backendData.data) {
          setCards(
            backendData.data.map((c: any) => ({
              _id: c._id,
              term: c.question,
              definition: c.answer,
            }))
          );
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const addCard = () => {
    const newCard = {
      _id: `new-${Date.now()}`,
      term: "",
      definition: "",
    };
    setCards([...cards, newCard]);
    setCurrentCardIndex(cards.length);
  };

  const removeCard = async (index: number) => {
    if (cards.length <= 1) return;
    const card = cards[index];
    const newCards = [...cards];
    // Nếu là card đã có trên backend thì gọi API xóa mề
    if (card._id && !card._id.startsWith("new-")) {
      try {
        await axios.delete(`/cards/${card._id}`);
        toast.success("Card deleted successfully");
      } catch (e) {
        console.error(e);
        toast.error("Failed to delete card");
      }
    }
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
      await axios.put(`/decks/${id}`, {
        name: title,
        description,
        cards: cards.map((card) => ({
          ...(card._id && !card._id.startsWith("new-")
            ? { _id: card._id }
            : {}),
          question: card.term,
          answer: card.definition,
        })),
      });
      toast.success("Flashcard set saved successfully");
      router.push("/library");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save flashcard set");
    }
  };

  const handleDeleteClick = (index: number) => {
    setPendingDeleteIndex(index);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (pendingDeleteIndex !== null) {
      await removeCard(pendingDeleteIndex);
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
                  onClick={() => handleDeleteClick(currentCardIndex)}
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
      <ConfirmDialog
        open={confirmOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Card"
        description="Are you sure you want to delete this card? This action cannot be undone."
      />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

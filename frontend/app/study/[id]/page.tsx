"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  RotateCcw,
  Clock,
  ThumbsDown,
  ThumbsUp,
  Zap,
} from "lucide-react";

type FlashCard = {
  id: string;
  term: string;
  definition: string;
  box: number; // For spaced repetition (0-5)
  nextReview: Date;
  interval: number; // Current interval in minutes
  ease: number; // Ease factor (starts at 2.5)
  reviews: number; // Number of times reviewed
};

export default function StudyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [flipped, setFlipped] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [studyComplete, setStudyComplete] = useState(false);
  const [cardsToReview, setCardsToReview] = useState<FlashCard[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock data loading
  useEffect(() => {
    // In a real app, fetch from API
    const mockCards: FlashCard[] = [
      {
        id: "1",
        term: "Photosynthesis",
        definition:
          "The process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll.",
        box: 0,
        nextReview: new Date(),
        interval: 1, // 1 minute
        ease: 2.5,
        reviews: 0,
      },
      {
        id: "2",
        term: "Mitochondria",
        definition:
          "Organelles found in large numbers in most cells, in which the biochemical processes of respiration and energy production occur.",
        box: 0,
        nextReview: new Date(),
        interval: 1, // 1 minute
        ease: 2.5,
        reviews: 0,
      },
      {
        id: "3",
        term: "Cellular Respiration",
        definition:
          "The process by which cells break down glucose and other molecules to generate ATP, releasing carbon dioxide and water as byproducts.",
        box: 0,
        nextReview: new Date(),
        interval: 1, // 1 minute
        ease: 2.5,
        reviews: 0,
      },
      {
        id: "4",
        term: "DNA",
        definition:
          "Deoxyribonucleic acid, a self-replicating material present in nearly all living organisms as the main constituent of chromosomes.",
        box: 0,
        nextReview: new Date(),
        interval: 1, // 1 minute
        ease: 2.5,
        reviews: 0,
      },
      {
        id: "5",
        term: "RNA",
        definition:
          "Ribonucleic acid, a nucleic acid present in all living cells that has structural similarities to DNA but contains ribose rather than deoxyribose.",
        box: 0,
        nextReview: new Date(),
        interval: 1, // 1 minute
        ease: 2.5,
        reviews: 0,
      },
    ];

    setCards(mockCards);
    setCardsToReview(mockCards);
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    if (cardsToReview.length > 0) {
      setProgress(
        Math.round(((cards.length - cardsToReview.length) / cards.length) * 100)
      );
    }
  }, [cardsToReview.length, cards.length]);

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  // Anki-like spaced repetition algorithm
  const handleResponse = (quality: "again" | "hard" | "good" | "easy") => {
    if (!flipped) return; // Don't process if card isn't flipped

    const card = { ...cardsToReview[currentCardIndex] };
    card.reviews += 1;

    // Calculate new interval and ease factor based on quality
    switch (quality) {
      case "again": // Failed completely - reset
        card.interval = 1; // 1 minute
        card.ease = Math.max(1.3, card.ease - 0.2);
        card.box = 0;
        break;
      case "hard": // Difficult to recall
        if (card.reviews <= 1) {
          card.interval = 5; // 5 minutes
        } else {
          card.interval = Math.round(card.interval * 1.2);
        }
        card.ease = Math.max(1.3, card.ease - 0.15);
        card.box = Math.min(5, card.box + 1);
        break;
      case "good": // Recalled with some effort
        if (card.reviews <= 1) {
          card.interval = 10; // 10 minutes
        } else {
          card.interval = Math.round(card.interval * card.ease);
        }
        card.box = Math.min(5, card.box + 1);
        break;
      case "easy": // Recalled easily
        if (card.reviews <= 1) {
          card.interval = 20; // 20 minutes
        } else {
          card.interval = Math.round(card.interval * card.ease * 1.3);
        }
        card.ease = card.ease + 0.15;
        card.box = Math.min(5, card.box + 2);
        break;
    }

    // Calculate next review date
    const nextReview = new Date();

    // For demo purposes, we'll use minutes instead of days
    // In a real app, you'd use days: nextReview.setDate(nextReview.getDate() + days)
    nextReview.setMinutes(nextReview.getMinutes() + card.interval);
    card.nextReview = nextReview;

    // Update the card in the cards array
    const newCards = [...cards];
    const cardIndex = newCards.findIndex((c) => c.id === card.id);
    if (cardIndex !== -1) {
      newCards[cardIndex] = card;
    }
    setCards(newCards);

    // Remove the current card from cardsToReview
    const newCardsToReview = [...cardsToReview];
    newCardsToReview.splice(currentCardIndex, 1);
    setCardsToReview(newCardsToReview);

    // If quality is 'again', add the card back to the end of the queue
    if (quality === "again") {
      newCardsToReview.push(card);
    }

    // Reset flipped state
    setFlipped(false);

    // If there are more cards to review, move to the next one
    if (newCardsToReview.length > 0) {
      setCurrentCardIndex(
        currentCardIndex >= newCardsToReview.length ? 0 : currentCardIndex
      );
    } else {
      // Study session complete
      setStudyComplete(true);
    }
  };

  // Format interval for display
  const formatInterval = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else if (minutes < 1440) {
      // Less than a day
      return `${Math.round(minutes / 60)} hr`;
    } else {
      return `${Math.round(minutes / 1440)} day`;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Loading...</div>
          <div className="text-muted-foreground">
            Preparing your study session
          </div>
        </div>
      </div>
    );
  }

  if (studyComplete) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header toggleSidebar={() => setSidebarOpen(true)} />
        <div className="flex flex-1">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 p-6 md:p-10 md:ml-0 transition-all duration-300 ease-in-out">
            <div className="mx-auto max-w-4xl">
              <div className="mb-6 flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/dashboard")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Library
                </Button>
              </div>

              <Card className="p-8 text-center">
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 mx-auto">
                  <ThumbsUp className="h-12 w-12" />
                </div>
                <h2 className="text-3xl font-bold mb-4">
                  Study Session Complete!
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  You've reviewed all {cards.length} cards in this deck. Great
                  job!
                </p>
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/library")}
                  >
                    Back to Library
                  </Button>
                  <Button
                    onClick={() => {
                      setCardsToReview(cards);
                      setCurrentCardIndex(0);
                      setProgress(0);
                      setStudyComplete(false);
                    }}
                  >
                    Study Again
                  </Button>
                </div>
              </Card>
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
              <Button variant="ghost" onClick={() => router.push("/library")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Library
              </Button>
              <div className="text-sm text-muted-foreground">
                Card {cards.length - cardsToReview.length + 1} of {cards.length}
              </div>
            </div>

            <Progress value={progress} className="mb-8" />

            <div className="flex justify-center mb-8">
              <Card
                className="w-full max-w-2xl h-80 perspective cursor-pointer"
                onClick={handleFlip}
              >
                <div
                  className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                    flipped ? "rotate-y-180" : ""
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center p-8 backface-hidden bg-card rounded-lg border">
                    <div className="text-2xl font-medium text-center">
                      {cardsToReview.length > 0
                        ? cardsToReview[currentCardIndex]?.term
                        : ""}
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center p-8 backface-hidden bg-card rounded-lg border rotate-y-180">
                    <div className="text-xl text-center">
                      {cardsToReview.length > 0
                        ? cardsToReview[currentCardIndex]?.definition
                        : ""}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="text-center mb-8 text-sm text-muted-foreground">
              {flipped
                ? "How well did you know this?"
                : "Click on the card to flip it"}
            </div>

            {flipped ? (
              <div className="grid grid-cols-4 gap-3">
                <div className="flex flex-col items-center">
                  <div className="text-sm font-medium mb-2 text-red-500">
                    1 min
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleResponse("again")}
                  >
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Again
                  </Button>
                </div>

                <div className="flex flex-col items-center">
                  <div className="text-sm font-medium mb-2 text-orange-500">
                    {formatInterval(
                      cardsToReview[currentCardIndex]?.interval * 1.2 || 5
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                    onClick={() => handleResponse("hard")}
                  >
                    <ThumbsDown className="mr-2 h-5 w-5" />
                    Hard
                  </Button>
                </div>

                <div className="flex flex-col items-center">
                  <div className="text-sm font-medium mb-2 text-green-500">
                    {formatInterval(
                      cardsToReview[currentCardIndex]?.interval *
                        (cardsToReview[currentCardIndex]?.ease || 2.5) || 10
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600"
                    onClick={() => handleResponse("good")}
                  >
                    <ThumbsUp className="mr-2 h-5 w-5" />
                    Good
                  </Button>
                </div>

                <div className="flex flex-col items-center">
                  <div className="text-sm font-medium mb-2 text-blue-500">
                    {formatInterval(
                      cardsToReview[currentCardIndex]?.interval *
                        (cardsToReview[currentCardIndex]?.ease || 2.5) *
                        1.3 || 20
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => handleResponse("easy")}
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Easy
                  </Button>
                </div>
              </div>
            ) : null}

            {cardsToReview.length > 0 &&
              cardsToReview[currentCardIndex]?.reviews > 0 && (
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  <Clock className="inline-block mr-1 h-4 w-4" />
                  Next review if "Good":{" "}
                  {formatInterval(
                    cardsToReview[currentCardIndex]?.interval *
                      (cardsToReview[currentCardIndex]?.ease || 2.5)
                  )}
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
}

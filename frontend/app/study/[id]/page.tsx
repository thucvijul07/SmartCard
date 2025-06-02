"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
} from "lucide-react";
import { Rating, State } from "ts-fsrs";
import axiosClient from "@/lib/axiosClient";
import { endOfDay, isBefore, parseISO } from "date-fns";

// Định nghĩa type cho các key rating
export type RatingLabel = "Again" | "Hard" | "Good" | "Easy";

type FlashCard = {
  id: string;
  question: string;
  answer: string;
  box: number; // For spaced repetition (0-5)
  nextReview: string; // ISO string
  interval: number; // Current interval in minutes
  ease: number; // Ease factor (starts at 2.5)
  reviews: number; // Number of times reviewed
  stability: number;
  difficulty: number;
  scheduled_days: number;
  elapsed_days: number;
  state: State;
  last_review: string;
  due: string;
  created_at: string;
  rating?: number;
  nextDueTimes?: Record<RatingLabel, string>;
};

// Merge cards theo ưu tiên: 5 learning → 5 review → 1 fresh
function mergeCards(
  learning: FlashCard[],
  review: FlashCard[],
  fresh: FlashCard[]
) {
  const merged: FlashCard[] = [];
  merged.push(...learning.slice(0, 5));
  merged.push(...review.slice(0, 5));
  if (fresh.length > 0) merged.push(fresh[0]);
  return merged;
}

export default function StudyPage() {
  const { id } = useParams();
  const router = useRouter();
  const [flipped, setFlipped] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [studyComplete, setStudyComplete] = useState(false);
  const [cardsToReview, setCardsToReview] = useState<FlashCard[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Đưa fetchCardsToReview ra ngoài useEffect để có thể gọi trong handleResponse
  const fetchCardsToReview = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("cards/review", {
        params: { deckId: id },
      });
      if (response.data.is_success) {
        const mapped = response.data.data.map((c: any) => ({
          id: c._id?.toString() || c.id,
          question: c.question,
          answer: c.answer,
          box: c.box ?? 0,
          nextReview: c.nextReview ?? "",
          interval: c.interval ?? 0,
          ease: c.ease ?? 2.5,
          reviews: c.reviews ?? 0,
          stability: c.stability ?? 0,
          difficulty: c.difficulty ?? 0,
          scheduled_days: c.scheduled_days ?? 0,
          elapsed_days: c.elapsed_days ?? 0,
          state: c.state ?? State.New,
          last_review: c.last_review ?? "",
          due: c.due ?? "",
          created_at: c.created_at ?? c.due ?? "",
          nextDueTimes: c.nextDueTimes ?? undefined,
        })) as FlashCard[];
        setCards(mapped);
        setCardsToReview(mapped);
        setStudyComplete(mapped.length === 0);
      } else {
        setCards([]);
        setCardsToReview([]);
        setStudyComplete(true);
      }
    } catch (error) {
      setCards([]);
      setCardsToReview([]);
      setStudyComplete(true);
      console.error("Error fetching cards to review:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    fetchCardsToReview();
    interval = setInterval(() => {
      if (!loading && !studyComplete) {
        fetchCardsToReview();
      }
    }, 3000);
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id]);

  useEffect(() => {
    if (cardsToReview.length > 0 && cards.length > 0) {
      setProgress(
        Math.round(((cards.length - cardsToReview.length) / cards.length) * 100)
      );
    }
  }, [cardsToReview.length, cards.length]);

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  // Helper để ánh xạ số sang tên rating
  const getRatingLabel = (quality: Rating): RatingLabel => {
    switch (quality) {
      case Rating.Again:
        return "Again";
      case Rating.Hard:
        return "Hard";
      case Rating.Good:
        return "Good";
      case Rating.Easy:
        return "Easy";
      default:
        return "Good";
    }
  };

  const handleResponse = async (quality: Rating) => {
    if (!flipped || cardsToReview.length === 0) return;
    const card = cardsToReview[0];
    try {
      // Gửi đánh giá lên API, lấy về thẻ đã cập nhật
      const res = await axiosClient.post("/cards/review", {
        cards: [
          {
            id: card.id,
            rating: quality,
            last_review: new Date().toISOString(),
          },
        ],
      });
      const updatedCard = res.data?.data?.[0];
      // Đảm bảo updatedCard có id đúng
      if (updatedCard) {
        updatedCard.id = updatedCard._id?.toString() || updatedCard.id;
      }
      // Loại bỏ thẻ cũ khỏi queue
      let newQueue = cardsToReview.slice(1).filter((c) => c.id !== card.id);
      // Nếu due mới <= endOfDay hôm nay thì thêm lại vào queue
      const todayEnd = endOfDay(new Date());
      const cardDue = updatedCard?.due ? parseISO(updatedCard.due) : null;
      if (
        (cardDue && isBefore(cardDue, todayEnd)) ||
        cardDue?.getTime() === todayEnd.getTime()
      ) {
        newQueue.push({ ...updatedCard });
      }
      // Chia lại queue
      const learning = newQueue
        .filter((c) => c.state === 1 || c.state === 3)
        .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
      const review = newQueue
        .filter((c) => c.state === 2 && new Date(c.due) <= todayEnd)
        .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
      const fresh = newQueue
        .filter((c) => c.state === 0)
        .sort(
          (a, b) =>
            new Date(a.created_at || a.due).getTime() -
            new Date(b.created_at || b.due).getTime()
        );
      // Merge lại queue
      const merged = mergeCards(learning, review, fresh);
      setFlipped(false);
      setCardsToReview(merged);
      if (merged.length === 0) setStudyComplete(true);
    } catch (error) {
      console.error("Failed to sync updated card or update queue:", error);
    }
  };

  const handleBackToLibrary = async () => {
    setLoading(false);
    router.push("/library");
  };

  const formatInterval = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    } else if (minutes < 1440) {
      // Less than a day
      return `${Math.round((minutes / 60) * 10) / 10} hr`;
    } else {
      return `${Math.round((minutes / 1440) * 10) / 10} day`;
    }
  };

  function formatDueDate(dateString: string | Date | undefined) {
    if (!dateString) return "-";
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    const now = new Date();
    const diff = (date.getTime() - now.getTime()) / 1000; // seconds
    if (diff < 60) return `${Math.round(diff)} sec`;
    if (diff < 3600) return `${Math.round((diff / 60) * 10) / 10} min`;
    if (diff < 86400) return `${Math.round((diff / 3600) * 10) / 10} hr`;
    return `${Math.round((diff / 86400) * 10) / 10} day`;
  }

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

  if (!loading && cards.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header toggleSidebar={() => setSidebarOpen(true)} />
        <div className="flex flex-1">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 p-6 md:p-10 md:ml-0 transition-all duration-300 ease-in-out">
            <div className="mx-auto max-w-4xl">
              <div className="mb-6 flex items-center justify-between">
                <Button variant="ghost" onClick={handleBackToLibrary}>
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
                  You've reviewed all cards today. Great job!
                </p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={handleBackToLibrary}>
                    Back to Library
                  </Button>
                  <Button
                    onClick={() => {
                      setCardsToReview(cards);
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

  if (studyComplete) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header toggleSidebar={() => setSidebarOpen(true)} />
        <div className="flex flex-1">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 p-6 md:p-10 md:ml-0 transition-all duration-300 ease-in-out">
            <div className="mx-auto max-w-4xl">
              <div className="mb-6 flex items-center justify-between">
                <Button variant="ghost" onClick={handleBackToLibrary}>
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
                  You've reviewed all cards today. Great job!
                </p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={handleBackToLibrary}>
                    Back to Library
                  </Button>
                  <Button
                    onClick={() => {
                      setCardsToReview(cards);
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
              <Button variant="ghost" onClick={handleBackToLibrary}>
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
                        ? cardsToReview[0]?.question
                        : ""}
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center p-8 backface-hidden bg-card rounded-lg border rotate-y-180">
                    <div className="text-xl text-center">
                      {cardsToReview.length > 0 ? cardsToReview[0]?.answer : ""}
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
                    {formatDueDate(cardsToReview[0]?.nextDueTimes?.Again)}
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleResponse(Rating.Again)}
                  >
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Again
                  </Button>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-sm font-medium mb-2 text-orange-500">
                    {formatDueDate(cardsToReview[0]?.nextDueTimes?.Hard)}
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                    onClick={() => handleResponse(Rating.Hard)}
                  >
                    <ThumbsDown className="mr-2 h-5 w-5" />
                    Hard
                  </Button>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-sm font-medium mb-2 text-green-500">
                    {formatDueDate(cardsToReview[0]?.nextDueTimes?.Good)}
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600"
                    onClick={() => handleResponse(Rating.Good)}
                  >
                    <ThumbsUp className="mr-2 h-5 w-5" />
                    Good
                  </Button>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-sm font-medium mb-2 text-blue-500">
                    {formatDueDate(cardsToReview[0]?.nextDueTimes?.Easy)}
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => handleResponse(Rating.Easy)}
                  >
                    Easy
                  </Button>
                </div>
              </div>
            ) : null}

            {cardsToReview.length > 0 && cardsToReview[0]?.reviews > 0 && (
              <div className="mt-6 text-center text-sm text-muted-foreground">
                <Clock className="inline-block mr-1 h-4 w-4" />
                Next review if "Good":{" "}
                {formatInterval(
                  cardsToReview[0]?.interval * (cardsToReview[0]?.ease || 2.5)
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

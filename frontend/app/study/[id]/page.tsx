"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react"

type FlashCard = {
  id: string
  term: string
  definition: string
  box: number // For spaced repetition (0-5)
  nextReview: Date
}

export default function StudyPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [cards, setCards] = useState<FlashCard[]>([])
  const [loading, setLoading] = useState(true)

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
      },
      {
        id: "2",
        term: "Mitochondria",
        definition:
          "Organelles found in large numbers in most cells, in which the biochemical processes of respiration and energy production occur.",
        box: 0,
        nextReview: new Date(),
      },
      {
        id: "3",
        term: "Cellular Respiration",
        definition:
          "The process by which cells break down glucose and other molecules to generate ATP, releasing carbon dioxide and water as byproducts.",
        box: 0,
        nextReview: new Date(),
      },
      {
        id: "4",
        term: "DNA",
        definition:
          "Deoxyribonucleic acid, a self-replicating material present in nearly all living organisms as the main constituent of chromosomes.",
        box: 0,
        nextReview: new Date(),
      },
      {
        id: "5",
        term: "RNA",
        definition:
          "Ribonucleic acid, a nucleic acid present in all living cells that has structural similarities to DNA but contains ribose rather than deoxyribose.",
        box: 0,
        nextReview: new Date(),
      },
    ]

    setCards(mockCards)
    setLoading(false)
  }, [params.id])

  useEffect(() => {
    if (cards.length > 0) {
      setProgress(Math.round((currentCardIndex / cards.length) * 100))
    }
  }, [currentCardIndex, cards.length])

  const handleFlip = () => {
    setFlipped(!flipped)
  }

  const handleResponse = (quality: number) => {
    // Implement spaced repetition algorithm (simplified SM-2)
    const card = { ...cards[currentCardIndex] }

    if (quality >= 3) {
      // Good response
      card.box = Math.min(5, card.box + 1)
    } else {
      // Bad response
      card.box = 0
    }

    // Calculate next review date based on box number
    const nextReview = new Date()
    switch (card.box) {
      case 0:
        nextReview.setMinutes(nextReview.getMinutes() + 1)
        break // 1 minute
      case 1:
        nextReview.setHours(nextReview.getHours() + 6)
        break // 6 hours
      case 2:
        nextReview.setDate(nextReview.getDate() + 1)
        break // 1 day
      case 3:
        nextReview.setDate(nextReview.getDate() + 3)
        break // 3 days
      case 4:
        nextReview.setDate(nextReview.getDate() + 7)
        break // 1 week
      case 5:
        nextReview.setDate(nextReview.getDate() + 14)
        break // 2 weeks
    }

    card.nextReview = nextReview

    const newCards = [...cards]
    newCards[currentCardIndex] = card
    setCards(newCards)

    // Move to next card
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setFlipped(false)
    } else {
      // End of session
      alert("Study session complete!")
      router.push("/dashboard")
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header toggleSidebar={() => setSidebarOpen(true)} />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">Loading...</div>
            <div className="text-muted-foreground">Preparing your study session</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header toggleSidebar={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 md:p-10">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center justify-between">
              <Button variant="ghost" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="text-sm text-muted-foreground">
                Card {currentCardIndex + 1} of {cards.length}
              </div>
            </div>

            <Progress value={progress} className="mb-8" />

            <div className="flex justify-center mb-8">
              <Card className="w-full max-w-2xl h-80 perspective cursor-pointer" onClick={handleFlip}>
                <div
                  className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                    flipped ? "rotate-y-180" : ""
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center p-8 backface-hidden bg-card rounded-lg border">
                    <div className="text-2xl font-medium text-center">{cards[currentCardIndex]?.term}</div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center p-8 backface-hidden bg-card rounded-lg border rotate-y-180">
                    <div className="text-xl text-center">{cards[currentCardIndex]?.definition}</div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="text-center mb-8 text-sm text-muted-foreground">Click on the card to flip it</div>

            {flipped && (
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="lg" className="flex-1 max-w-xs" onClick={() => handleResponse(1)}>
                  <ThumbsDown className="mr-2 h-5 w-5" />
                  Difficult
                </Button>
                <Button variant="outline" size="lg" className="flex-1 max-w-xs" onClick={() => handleResponse(3)}>
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Review Again
                </Button>
                <Button variant="default" size="lg" className="flex-1 max-w-xs" onClick={() => handleResponse(5)}>
                  <ThumbsUp className="mr-2 h-5 w-5" />
                  Easy
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}


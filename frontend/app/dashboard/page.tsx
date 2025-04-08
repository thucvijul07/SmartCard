"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const recentSets = [
    { id: "1", title: "Biology 101", cards: 50, lastStudied: "2 days ago" },
    { id: "2", title: "Chemistry Basics", cards: 30, lastStudied: "1 week ago" },
    { id: "3", title: "Spanish Vocabulary", cards: 100, lastStudied: "3 days ago" },
  ]

  const popularSets = [
    { id: "4", title: "World History", cards: 75, creator: "Jane Doe", studyCount: 1250 },
    { id: "5", title: "Physics Formulas", cards: 40, creator: "John Smith", studyCount: 980 },
    { id: "6", title: "English Literature", cards: 60, creator: "Alice Johnson", studyCount: 750 },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header toggleSidebar={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 md:p-10 md:ml-0 transition-all duration-300 ease-in-out">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 flex items-center justify-between">
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <Button onClick={() => router.push("/create")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Flashcards
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <Card>
                <CardContent className="p-6">
                  <div className="text-4xl font-bold text-primary mb-2">12</div>
                  <div className="text-sm text-muted-foreground">Flashcard Sets</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-4xl font-bold text-primary mb-2">548</div>
                  <div className="text-sm text-muted-foreground">Cards Studied</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-4xl font-bold text-primary mb-2">85%</div>
                  <div className="text-sm text-muted-foreground">Retention Rate</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="recent" className="w-full mb-10">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                <TabsTrigger value="recent">Recent Sets</TabsTrigger>
                <TabsTrigger value="popular">Popular Sets</TabsTrigger>
              </TabsList>
              <TabsContent value="recent">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentSets.map((set) => (
                    <Card key={set.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <h3 className="font-medium mb-2">{set.title}</h3>
                        <div className="flex justify-between text-sm text-muted-foreground mb-4">
                          <span>{set.cards} cards</span>
                          <span>Last studied: {set.lastStudied}</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/study/${set.id}`)}>
                          Study Now
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="popular">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popularSets.map((set) => (
                    <Card key={set.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <h3 className="font-medium mb-2">{set.title}</h3>
                        <div className="flex justify-between text-sm text-muted-foreground mb-4">
                          <span>{set.cards} cards</span>
                          <span>By: {set.creator}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mb-4">
                          {set.studyCount.toLocaleString()} studies
                        </div>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/study/${set.id}`)}>
                          Study Now
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Study Streak</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center gap-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-16 w-10 rounded-md flex items-center justify-center ${
                          i < 5 ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        {i < 5 && "✓"}
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-4 text-sm text-muted-foreground">
                    You're on a 5-day streak! Keep it up!
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}


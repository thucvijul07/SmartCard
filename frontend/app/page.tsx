"use client"

import Link from "next/link"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, BookOpen, Sparkles, BrainCircuit, ArrowRight, CheckCircle } from "lucide-react"

export default function Home() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header toggleSidebar={() => setSidebarOpen(true)} />
          <main className="flex-1 p-6 md:p-10 md:ml-0 transition-all duration-300 ease-in-out">
            <div className="mx-auto max-w-6xl">
              <h1 className="text-3xl font-bold mb-6">Welcome to SmartCard</h1>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">Popular Flashcards</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <h3 className="font-medium mb-2">Biology 101</h3>
                        <p className="text-sm text-muted-foreground mb-4">50 cards • Created by John Doe</p>
                        <Button variant="outline" size="sm">
                          Study Now
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Top Creators</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                          JD
                        </div>
                        <div>
                          <h3 className="font-medium">Jane Doe</h3>
                          <p className="text-sm text-muted-foreground">120 flashcard sets</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </div>
          </main>
        </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Learn Smarter with SmartCard
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Create, study, and master your subjects with our intelligent flashcard system
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => router.push("/login")}>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Smart Learning</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Study Smarter, Not Harder</h2>
                <p className="text-muted-foreground md:text-xl">
                  Our spaced repetition algorithm helps you remember more in less time by showing you cards at the
                  optimal moment.
                </p>
              </div>
              <div className="flex justify-center">
                <div className="relative h-[300px] w-[300px] rounded-lg bg-muted p-4 shadow-lg">
                  <div className="absolute top-10 left-10 h-[200px] w-[250px] rounded bg-card p-4 shadow-md rotate-6">
                    <div className="font-medium">What is photosynthesis?</div>
                  </div>
                  <div className="absolute top-20 left-20 h-[200px] w-[250px] rounded bg-card p-4 shadow-md -rotate-3">
                    <div className="font-medium">
                      The process by which plants convert light energy into chemical energy.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-5xl text-center">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl mb-8">How It Works</h2>
              <Tabs defaultValue="create" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="create">Create</TabsTrigger>
                  <TabsTrigger value="study">Study</TabsTrigger>
                  <TabsTrigger value="master">Master</TabsTrigger>
                </TabsList>
                <TabsContent value="create" className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <BookOpen className="h-16 w-16 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Create Your Flashcards</h3>
                  <p className="text-muted-foreground">
                    Create your own flashcards or use our AI to generate them from your notes or textbooks.
                  </p>
                  <div className="flex justify-center mt-4">
                    <Button variant="outline" onClick={() => router.push("/login")}>
                      Try It Now
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="study" className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <Brain className="h-16 w-16 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Study Efficiently</h3>
                  <p className="text-muted-foreground">
                    Our spaced repetition algorithm shows you cards at the optimal time for maximum retention.
                  </p>
                  <div className="flex justify-center mt-4">
                    <Button variant="outline" onClick={() => router.push("/login")}>
                      Try It Now
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="master" className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <CheckCircle className="h-16 w-16 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Master Your Subjects</h3>
                  <p className="text-muted-foreground">
                    Track your progress and see your knowledge grow over time with detailed analytics.
                  </p>
                  <div className="flex justify-center mt-4">
                    <Button variant="outline" onClick={() => router.push("/login")}>
                      Try It Now
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-5xl text-center">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl mb-8">Powerful AI Features</h2>
              <div className="grid gap-8 md:grid-cols-2">
                <Card>
                  <CardContent className="p-6 flex flex-col items-center">
                    <Sparkles className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-bold mb-2">AI Flashcards</h3>
                    <p className="text-muted-foreground">
                      Generate flashcards automatically from your notes, textbooks, or any text using our advanced AI.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 flex flex-col items-center">
                    <BrainCircuit className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-bold mb-2">AI Quiz</h3>
                    <p className="text-muted-foreground">
                      Test your knowledge with AI-generated quizzes tailored to your learning materials.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-5xl text-center">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl mb-4">Ready to Start Learning?</h2>
              <p className="text-muted-foreground mb-8 md:text-xl">
                Join thousands of students who are already learning smarter with SmartCard.
              </p>
              <Button size="lg" onClick={() => router.push("/login")}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">© 2025 SmartCard. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}


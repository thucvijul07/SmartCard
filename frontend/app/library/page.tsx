"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { BookOpen, Edit, Search, Clock, Star, BarChart } from "lucide-react";

// Mock data for flashcard sets
const flashcardSets = [
  {
    id: "1",
    title: "Biology 101",
    cards: 50,
    lastStudied: "2 days ago",
    creator: "You",
  },
  {
    id: "2",
    title: "Chemistry Basics",
    cards: 30,
    lastStudied: "1 week ago",
    creator: "You",
  },
  {
    id: "3",
    title: "Spanish Vocabulary",
    cards: 100,
    lastStudied: "3 days ago",
    creator: "You",
  },
  {
    id: "4",
    title: "World History",
    cards: 75,
    lastStudied: "5 days ago",
    creator: "You",
  },
  {
    id: "5",
    title: "Physics Formulas",
    cards: 40,
    lastStudied: "2 weeks ago",
    creator: "You",
  },
  {
    id: "6",
    title: "English Literature",
    cards: 60,
    lastStudied: "1 day ago",
    creator: "You",
  },
];

// Mock data for practice quizzes
const practiceQuizzes = [
  {
    id: "1",
    title: "Biology Midterm",
    questions: 20,
    lastTaken: "3 days ago",
    score: "85%",
  },
  {
    id: "2",
    title: "Chemistry Quiz",
    questions: 15,
    lastTaken: "1 week ago",
    score: "92%",
  },
  {
    id: "3",
    title: "Spanish Test",
    questions: 25,
    lastTaken: "2 days ago",
    score: "78%",
  },
  {
    id: "4",
    title: "History Review",
    questions: 30,
    lastTaken: "4 days ago",
    score: "88%",
  },
];

export default function LibraryPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFlashcardSets = flashcardSets.filter((set) =>
    set.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPracticeQuizzes = practiceQuizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header toggleSidebar={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 md:p-10 md:ml-0 transition-all duration-300 ease-in-out">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className="text-3xl font-bold">Your Library</h1>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search library..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Tabs defaultValue="flashcards" className="w-full mb-10">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                <TabsTrigger value="flashcards">Flashcard Sets</TabsTrigger>
                <TabsTrigger value="quizzes">Practice Quizzes</TabsTrigger>
              </TabsList>

              <TabsContent value="flashcards">
                {filteredFlashcardSets.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No flashcard sets found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery
                        ? "Try a different search term"
                        : "Create your first flashcard set to get started"}
                    </p>
                    <Button onClick={() => router.push("/create")}>
                      Create Flashcard Set
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredFlashcardSets.map((set) => (
                      <Card
                        key={set.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">{set.title}</h3>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {set.lastStudied}
                            </div>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground mb-4">
                            <span>{set.cards} cards</span>
                            <span>By: {set.creator}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1"
                              onClick={() => router.push(`/study/${set.id}`)}
                            >
                              <BookOpen className="h-4 w-4 mr-2" />
                              Study
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() =>
                                router.push(`/edit-flashcard/${set.id}`)
                              }
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="quizzes">
                {filteredPracticeQuizzes.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No practice quizzes found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery
                        ? "Try a different search term"
                        : "Create your first quiz to get started"}
                    </p>
                    <Button onClick={() => router.push("/ai-quiz")}>
                      Create Quiz
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPracticeQuizzes.map((quiz) => (
                      <Card
                        key={quiz.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">{quiz.title}</h3>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {quiz.lastTaken}
                            </div>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground mb-4">
                            <span>{quiz.questions} questions</span>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 mr-1 text-yellow-500" />
                              <span>{quiz.score}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1"
                              onClick={() =>
                                router.push(`/take-quiz/${quiz.id}`)
                              }
                            >
                              <BookOpen className="h-4 w-4 mr-2" />
                              Take Quiz
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() =>
                                router.push(`/edit-quiz/${quiz.id}`)
                              }
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

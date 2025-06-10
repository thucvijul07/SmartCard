"use client";

import { useState, useEffect } from "react";
import axiosClient from "@/lib/axiosClient";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToastContainer, toast } from "react-toastify";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { BookOpen, Edit, Search, Star, BarChart } from "lucide-react";

type Deck = {
  id: string;
  name: string;
  description: string;
  parent_deck_id: string | null;
  card_count: number;
};
export default function LibraryPage() {
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState({
    title: "",
    description: "",
    onConfirm: () => {},
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  // Quiz sets state
  const [quizSets, setQuizSets] = useState<any[]>([]);
  const [quizLoading, setQuizLoading] = useState(true);

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const response = await axiosClient.get("/decks");
        if (response.data.is_success) {
          setDecks(response.data.data);
        } else {
          console.error("Failed to fetch decks");
          toast.error("Failed to fetch decks");
        }
      } catch (error) {
        console.error("Error fetching decks:", error);
        toast.error("Error fetching decks");
      } finally {
        setLoading(false);
      }
    };
    fetchDecks();
  }, []);

  useEffect(() => {
    const fetchQuizSets = async () => {
      try {
        const response = await axiosClient.get("/quiz/");
        if (response.data.isSuccess) {
          setQuizSets(response.data.data);
        } else {
          toast.error("Failed to fetch quizzes");
        }
      } catch (error) {
        toast.error("Error fetching quizzes");
      } finally {
        setQuizLoading(false);
      }
    };
    fetchQuizSets();
  }, []);

  if (loading || quizLoading) {
    return <div>Loading...</div>;
  }

  const filteredFlashcardSets = decks.filter((set) =>
    set.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPracticeQuizzes = quizSets.filter((quiz) =>
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
                            <h3 className="font-medium">{set.name}</h3>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground mb-4">
                            <span>{set.card_count} cards</span>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground mb-4">
                            <span>{set.description}</span>
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
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDialogContent({
                                  title: "Confirm delete",
                                  description: `Are you sure you want to delete the flashcard set "${set.name}"?`,
                                  onConfirm: async () => {
                                    try {
                                      await axiosClient.delete(
                                        `/decks/${set.id}`
                                      );
                                      setDecks((prev) =>
                                        prev.filter((d) => d.id !== set.id)
                                      );
                                      toast.success("Deleted successfully");
                                    } catch (err) {
                                      toast.error("Delete failed");
                                    } finally {
                                      setOpenDialog(false);
                                    }
                                  },
                                });
                                setOpenDialog(true);
                              }}
                            >
                              Delete
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
                        key={quiz._id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">{quiz.title}</h3>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground mb-4">
                            <span>{quiz.totalQuestions} questions</span>
                            <div className="flex flex-col items-end">
                              <span className="flex items-center">
                                <Star className="h-3 w-3 mr-1 text-yellow-500" />{" "}
                                {quiz.correct}/{quiz.attempts} correct
                              </span>
                            </div>
                          </div>
                          <div className="flex text-xs text-muted-foreground mb-2">
                            <span>
                              Created:{" "}
                              {new Date(quiz.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1"
                              onClick={() =>
                                router.push(`/take-quiz/${quiz._id}`)
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
                                router.push(`/edit-quiz/${quiz._id}`)
                              }
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDialogContent({
                                  title: "Confirm delete",
                                  description: `Are you sure you want to delete the quiz set "${quiz.title}"?`,
                                  onConfirm: async () => {
                                    try {
                                      await axiosClient.delete(
                                        `/quiz/set/${quiz._id}`
                                      );
                                      setQuizSets((prev) =>
                                        prev.filter((q) => q._id !== quiz._id)
                                      );
                                      toast.success("Deleted successfully");
                                    } catch (err) {
                                      toast.error("Delete failed");
                                    } finally {
                                      setOpenDialog(false);
                                    }
                                  },
                                });
                                setOpenDialog(true);
                              }}
                            >
                              Delete
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
          <ConfirmDialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            onConfirm={dialogContent.onConfirm}
            title={dialogContent.title}
            description={dialogContent.description}
          />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </main>
      </div>
    </div>
  );
}

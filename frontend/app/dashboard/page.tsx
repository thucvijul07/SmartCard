"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import axiosClient from "@/lib/axiosClient";
import dynamic from "next/dynamic";
const CalendarHeatmap = dynamic(() => import("react-calendar-heatmap"), {
  ssr: false,
});
import "react-calendar-heatmap/dist/styles.css";
import "@/styles/heatmap-custom.css";

export default function DashboardPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalDecks: 0,
    totalCardsReviewed: 0,
    totalQuizAttempts: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [studyDays, setStudyDays] = useState<string[]>([]);
  const [loadingHeatmap, setLoadingHeatmap] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosClient.get("/statistics");
        if (res.data?.is_success && res.data.data) {
          setStats(res.data.data);
        }
      } catch (err) {
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchStudyDays = async () => {
      try {
        const res = await axiosClient.get("/statistics/study-days");
        if (res.data?.is_success && Array.isArray(res.data.data)) {
          setStudyDays(res.data.data);
        }
      } catch (err) {
      } finally {
        setLoadingHeatmap(false);
      }
    };
    fetchStudyDays();
  }, []);

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
                  <div className="text-4xl font-bold text-primary mb-2">
                    {loadingStats ? "..." : stats.totalDecks}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Flashcard Sets
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {loadingStats ? "..." : stats.totalCardsReviewed}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Cards Studied
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {loadingStats ? "..." : stats.totalQuizAttempts}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Completed Quiz
                  </div>
                </CardContent>
              </Card>
            </div>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Study Streak</h2>
              <div className="overflow-x-auto max-w-full ">
                <div className="scale-[0.9] md:scale-[0.8]">
                  <CalendarHeatmap
                    startDate={new Date(new Date().getFullYear(), 0, 1)}
                    endDate={new Date()}
                    values={studyDays.map((date) => ({ date, count: 1 }))}
                    classForValue={(value: any) => {
                      if (!value || !value.date)
                        return "react-calendar-heatmap-empty";
                      return "react-calendar-heatmap-color-filled";
                    }}
                    showWeekdayLabels={true}
                    rectSize={4}
                  />
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}


import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/dashboard/StatCard";
import GuestStatusChart from "@/components/dashboard/GuestStatusChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { Calendar, CheckCircle, QrCode, Users } from "lucide-react";
import { mockDashboardService } from "@/services/api/mockDashboardService";
import { mockEventStatsService } from "@/services/api/mockEventStatsService";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month" | "year">("today");

  // Pobieranie statystyk dashboardu
  const { 
    data: dashboardStats,
    isLoading: isStatsLoading,
    error: statsError 
  } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => mockDashboardService.getStats(),
  });

  // Pobieranie statystyk wydarzeń w zależności od wybranego zakresu czasu
  const { 
    data: eventStats,
    isLoading: isEventStatsLoading,
    error: eventStatsError 
  } = useQuery({
    queryKey: ['eventStats', timeRange],
    queryFn: () => mockEventStatsService.getEventStatsByTimeRange(timeRange),
  });

  // Pobieranie ostatnich aktywności
  const { 
    data: recentActivityData,
    isLoading: isActivitiesLoading,
    error: activitiesError 
  } = useQuery({
    queryKey: ['recentActivities'],
    queryFn: () => mockDashboardService.getRecentActivity(5),
  });

  // Przygotowanie danych dla komponentów
  const statData = {
    totalGuests: dashboardStats?.data?.totalGuests || 0,
    checkedIn: dashboardStats?.data?.checkInStats?.today || 0,
    upcomingEvents: dashboardStats?.data?.upcomingEvents || 0,
    scannedToday: dashboardStats?.data?.checkInStats?.today || 0,
  };

  const chartData = eventStats?.data?.statusDistribution || [
    { name: "Obecni", value: 0, color: "#22c55e" },
    { name: "Potwierdzeni", value: 0, color: "#3b82f6" },
    { name: "Zaproszeni", value: 0, color: "#f59e0b" },
    { name: "Odrzuceni", value: 0, color: "#ef4444" },
  ];

  const activities = recentActivityData?.data || [];

  // Handler zmiany zakresu czasu dla statystyk
  const handleTimeRangeChange = (newRange: "today" | "week" | "month" | "year") => {
    setTimeRange(newRange);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Przegląd wydarzeń i gości w systemie Press Acreditations.
          </p>
        </div>

        {isStatsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-lg bg-muted animate-pulse"></div>
            ))}
          </div>
        ) : statsError ? (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            Wystąpił błąd podczas pobierania statystyk. Spróbuj odświeżyć stronę.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Wszyscy goście"
              value={statData.totalGuests}
              icon={<Users className="h-5 w-5" />}
            />
            <StatCard
              title="Obecni goście"
              value={statData.checkedIn}
              icon={<CheckCircle className="h-5 w-5" />}
              description={`${statData.totalGuests > 0 ? Math.round((statData.checkedIn / statData.totalGuests) * 100) : 0}% wszystkich zaproszonych`}
            />
            <StatCard
              title="Nadchodzące wydarzenia"
              value={statData.upcomingEvents}
              icon={<Calendar className="h-5 w-5" />}
            />
            <StatCard
              title="Zeskanowani dziś"
              value={statData.scannedToday}
              icon={<QrCode className="h-5 w-5" />}
            />
          </div>
        )}

        <div className="grid gap-6">
          {isEventStatsLoading ? (
            <div className="h-80 rounded-lg bg-muted animate-pulse"></div>
          ) : eventStatsError ? (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
              Wystąpił błąd podczas pobierania statystyk wydarzeń. Spróbuj odświeżyć stronę.
            </div>
          ) : (
            <GuestStatusChart 
              data={chartData} 
              timeRange={timeRange} 
              onTimeRangeChange={handleTimeRangeChange}
              additionalData={eventStats?.data || {}}
            />
          )}
          
          <div className="grid gap-6 md:grid-cols-2">
            {isActivitiesLoading ? (
              <div className="h-80 rounded-lg bg-muted animate-pulse"></div>
            ) : activitiesError ? (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
                Wystąpił błąd podczas pobierania ostatnich aktywności. Spróbuj odświeżyć stronę.
              </div>
            ) : (
              <RecentActivity activities={activities} />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;

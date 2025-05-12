
import React, { useState, useEffect } from "react";
import StatCard from "@/components/dashboard/StatCard";
import GuestStatusChart from "@/components/dashboard/GuestStatusChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import DatabaseSchema from "@/components/database/DatabaseSchema";
import { Calendar, CheckCircle, QrCode, Users, Database, AlertTriangle } from "lucide-react";
import { mockDashboardService } from "@/services/api/mockDashboardService";
import { mockEventStatsService } from "@/services/api/mockEventStatsService";
import { useQuery } from "@tanstack/react-query";
import { SyncStatus } from "@/components/offline/SyncStatus";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month" | "year">("today");
  const [activeTab, setActiveTab] = useState<"overview" | "schema">("overview");
  const { isOnline, wasOffline } = useOnlineStatus();
  
  // Show toast when coming back online after being offline
  useEffect(() => {
    if (isOnline && wasOffline) {
      toast({
        title: "Połączenie przywrócone",
        description: "Jesteś teraz online. Dane zostaną zsynchronizowane automatycznie.",
        variant: "default",
      });
    }
  }, [isOnline, wasOffline]);

  // Fetch dashboard stats
  const { 
    data: dashboardStats,
    isLoading: isStatsLoading,
    error: statsError 
  } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => mockDashboardService.getStats(),
    // Don't auto-refresh when offline
    refetchOnWindowFocus: isOnline,
    // We can use cached data for longer when offline
    staleTime: isOnline ? 5 * 60 * 1000 : 60 * 60 * 1000, // 5 minutes online, 1 hour offline
  });

  // Fetch event stats based on selected time range
  const { 
    data: eventStats,
    isLoading: isEventStatsLoading,
    error: eventStatsError 
  } = useQuery({
    queryKey: ['eventStats', timeRange],
    queryFn: () => mockEventStatsService.getEventStatsByTimeRange(timeRange),
    refetchOnWindowFocus: isOnline,
    staleTime: isOnline ? 5 * 60 * 1000 : 60 * 60 * 1000,
  });

  // Fetch recent activities
  const { 
    data: recentActivityData,
    isLoading: isActivitiesLoading,
    error: activitiesError 
  } = useQuery({
    queryKey: ['recentActivities'],
    queryFn: () => mockDashboardService.getRecentActivity(5),
    refetchOnWindowFocus: isOnline,
    staleTime: isOnline ? 5 * 60 * 1000 : 60 * 60 * 1000,
  });

  // Prepare data for components
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

  // Handler for time range change for stats
  const handleTimeRangeChange = (newRange: "today" | "week" | "month" | "year") => {
    setTimeRange(newRange);
  };

  // Simulate sync function for demonstration
  const handleSync = async () => {
    // In a real app, this would synchronize with the backend
    return new Promise<void>((resolve) => setTimeout(resolve, 1500));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Przegląd wydarzeń i gości w systemie Press Acreditations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SyncStatus onSyncClick={handleSync} />
        </div>
      </div>

      {!isOnline && (
        <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-900">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Tryb offline</AlertTitle>
          <AlertDescription className="text-amber-700">
            Pracujesz w trybie offline. Niektóre dane mogą być nieaktualne. Zmiany zostaną zsynchronizowane po przywróceniu połączenia.
          </AlertDescription>
        </Alert>
      )}

      <Tabs 
        value={activeTab} 
        onValueChange={(v) => setActiveTab(v as "overview" | "schema")} 
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>Przegląd</span>
          </TabsTrigger>
          <TabsTrigger value="schema" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>Struktura bazy danych</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
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

          <div className="grid gap-6 mt-6">
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
        </TabsContent>
        
        <TabsContent value="schema">
          <DatabaseSchema />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

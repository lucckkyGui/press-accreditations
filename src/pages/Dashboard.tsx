
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/dashboard/StatCard";
import GuestStatusChart from "@/components/dashboard/GuestStatusChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { Calendar, CheckCircle, QrCode, Users } from "lucide-react";

const Dashboard = () => {
  // Mock data dla MVP
  const statData = {
    totalGuests: 248,
    checkedIn: 137,
    upcomingEvents: 3,
    scannedToday: 42,
  };

  const chartData = [
    { name: "Obecni", value: 137, color: "#22c55e" },
    { name: "Potwierdzeni", value: 56, color: "#3b82f6" },
    { name: "Zaproszeni", value: 43, color: "#f59e0b" },
    { name: "Odrzuceni", value: 12, color: "#ef4444" },
  ];

  const recentActivities = [
    {
      id: "1",
      guestName: "Piotr Nowak",
      action: "Właśnie wszedł na wydarzenie",
      time: "5 min temu",
      zone: "vip",
    },
    {
      id: "2",
      guestName: "Anna Kowalska",
      action: "Zaproszenie zostało otwarte",
      time: "17 min temu",
      zone: "press",
    },
    {
      id: "3",
      guestName: "Jan Wiśniewski",
      action: "Potwierdził udział",
      time: "34 min temu",
    },
    {
      id: "4",
      guestName: "Marta Zielińska",
      action: "Wejście zostało odmówione",
      time: "52 min temu",
      zone: "general",
    },
    {
      id: "5",
      guestName: "Tomasz Kowalczyk",
      action: "Odmówił udziału",
      time: "1h temu",
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Przegląd wydarzeń i gości w systemie Press Acreditations.
          </p>
        </div>

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
            description={`${Math.round((statData.checkedIn / statData.totalGuests) * 100)}% wszystkich zaproszonych`}
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

        <div className="grid gap-4 md:grid-cols-3">
          <GuestStatusChart data={chartData} />
          <RecentActivity activities={recentActivities} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;

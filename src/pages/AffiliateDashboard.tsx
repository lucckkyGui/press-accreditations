import React, { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Users, DollarSign, TrendingUp, Gift, ExternalLink, Share2, Award } from "lucide-react";
import { toast } from "sonner";

const AffiliateDashboard = () => {
  usePageTitle("Program partnerski");
  const [referralCode] = useState("PA-" + Math.random().toString(36).substring(2, 8).toUpperCase());
  const referralLink = `https://press-accreditations.lovable.app/?ref=${referralCode}`;

  const stats = {
    totalReferrals: 47,
    activeUsers: 31,
    totalEarnings: 2340,
    pendingPayout: 580,
    conversionRate: 65.9,
    tier: "Gold",
  };

  const referrals = [
    { id: 1, email: "jan@example.com", date: "2026-03-15", status: "active", plan: "Pro", commission: 49 },
    { id: 2, email: "anna@media.pl", date: "2026-03-20", status: "active", plan: "Enterprise", commission: 149 },
    { id: 3, email: "mark@events.eu", date: "2026-03-22", status: "trial", plan: "Free", commission: 0 },
    { id: 4, email: "ola@agency.com", date: "2026-04-01", status: "active", plan: "Pro", commission: 49 },
    { id: 5, email: "tom@press.de", date: "2026-04-03", status: "pending", plan: "—", commission: 0 },
  ];

  const tiers = [
    { name: "Bronze", min: 0, max: 9, rate: "15%", color: "bg-amber-700" },
    { name: "Silver", min: 10, max: 24, rate: "20%", color: "bg-gray-400" },
    { name: "Gold", min: 25, max: 49, rate: "25%", color: "bg-yellow-500" },
    { name: "Platinum", min: 50, max: Infinity, rate: "30%", color: "bg-blue-400" },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Link skopiowany do schowka");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Program Partnerski</h1>
        <p className="text-muted-foreground">Zarabiaj polecając Press Accreditations</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Polecenia", value: stats.totalReferrals, icon: Users, color: "text-blue-500" },
          { label: "Aktywni użytkownicy", value: stats.activeUsers, icon: TrendingUp, color: "text-green-500" },
          { label: "Zarobki (PLN)", value: `${stats.totalEarnings} zł`, icon: DollarSign, color: "text-yellow-500" },
          { label: "Do wypłaty", value: `${stats.pendingPayout} zł`, icon: Gift, color: "text-purple-500" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
                <s.icon className={`h-8 w-8 ${s.color} opacity-70`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" /> Twój link polecający
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input value={referralLink} readOnly className="font-mono text-sm" />
            <Button onClick={copyLink} variant="outline"><Copy className="h-4 w-4" /></Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Kod: <span className="font-mono font-bold">{referralCode}</span></p>
        </CardContent>
      </Card>

      <Tabs defaultValue="referrals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="referrals">Polecenia</TabsTrigger>
          <TabsTrigger value="tiers">Poziomy</TabsTrigger>
          <TabsTrigger value="payouts">Wypłaty</TabsTrigger>
        </TabsList>

        <TabsContent value="referrals">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead className="text-right">Prowizja</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.email}</TableCell>
                      <TableCell>{r.date}</TableCell>
                      <TableCell>
                        <Badge variant={r.status === "active" ? "default" : "secondary"}>
                          {r.status === "active" ? "Aktywny" : r.status === "trial" ? "Trial" : "Oczekujący"}
                        </Badge>
                      </TableCell>
                      <TableCell>{r.plan}</TableCell>
                      <TableCell className="text-right font-bold">{r.commission > 0 ? `${r.commission} zł` : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers">
          <div className="grid gap-4 md:grid-cols-4">
            {tiers.map(t => (
              <Card key={t.name} className={stats.tier === t.name ? "ring-2 ring-primary" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${t.color}`} />
                    <CardTitle className="text-base">{t.name}</CardTitle>
                    {stats.tier === t.name && <Badge variant="default" className="ml-auto">Twój poziom</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{t.rate}</p>
                  <p className="text-sm text-muted-foreground">prowizji od każdej subskrypcji</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t.max === Infinity ? `${t.min}+ poleceń` : `${t.min}-${t.max} poleceń`}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>Historia wypłat</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Kwota</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Metoda</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { date: "2026-03-01", amount: "890 zł", status: "Wypłacono", method: "Przelew bankowy" },
                    { date: "2026-02-01", amount: "670 zł", status: "Wypłacono", method: "Przelew bankowy" },
                    { date: "2026-01-01", amount: "200 zł", status: "Wypłacono", method: "PayPal" },
                  ].map((p, i) => (
                    <TableRow key={i}>
                      <TableCell>{p.date}</TableCell>
                      <TableCell className="font-bold">{p.amount}</TableCell>
                      <TableCell><Badge variant="default">{p.status}</Badge></TableCell>
                      <TableCell>{p.method}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AffiliateDashboard;

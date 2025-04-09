
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatsCardsProps = {
  total: number;
  successful: number;
  failed: number;
};

const StatsCards: React.FC<StatsCardsProps> = ({ total, successful, failed }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-center text-2xl">{total}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-center text-sm text-muted-foreground">
          Łącznie skanów
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-center text-2xl text-green-600">{successful}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-center text-sm text-muted-foreground">
          Wejścia zatwierdzone
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-center text-2xl text-red-600">{failed}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-center text-sm text-muted-foreground">
          Wejścia odrzucone
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;

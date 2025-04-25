
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatsCardsProps = {
  total: number;
  successful: number;
  failed: number;
};

const StatsCards: React.FC<StatsCardsProps> = ({ total, successful, failed }) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-center p-3">
          <CardTitle className="text-xl text-center">{total}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 text-center">
          <p className="text-xs text-muted-foreground">Łącznie</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-center p-3">
          <CardTitle className={cn("text-xl text-center text-green-600")}>{successful}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 text-center">
          <p className="text-xs text-muted-foreground">Zatwierdzonych</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-center p-3">
          <CardTitle className={cn("text-xl text-center text-red-600")}>{failed}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 text-center">
          <p className="text-xs text-muted-foreground">Odrzuconych</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;

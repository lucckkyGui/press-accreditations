import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Music, Users, Award, Mic } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { Badge } from "@/components/ui/badge";

const eventCategories = [
  {
    id: "festivals",
    title: "Festivals",
    titlePl: "Festiwale",
    icon: Award,
    count: 12,
    color: "bg-pink-500"
  },
  {
    id: "sports",
    title: "Sports Events",
    titlePl: "Wydarzenia sportowe",
    icon: Users,
    count: 8,
    color: "bg-blue-500"
  },
  {
    id: "concerts",
    title: "Concerts",
    titlePl: "Koncerty",
    icon: Music,
    count: 15,
    color: "bg-purple-500"
  },
  {
    id: "conferences",
    title: "Press Conferences",
    titlePl: "Konferencje prasowe",
    icon: Mic,
    count: 6,
    color: "bg-yellow-500"
  },
  {
    id: "other",
    title: "Other Events",
    titlePl: "Inne wydarzenia",
    icon: Calendar,
    count: 10,
    color: "bg-green-500"
  }
];

const AccreditationCategories = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { t, currentLanguage } = useI18n();

  const filteredCategories = eventCategories.filter(category => 
    (currentLanguage === 'en' ? category.title : category.titlePl)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{t('accreditation.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('accreditation.requestForm')}
          </p>
        </div>

        <div className="mb-6">
          <Input
            placeholder={t('common.searchEvents')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md mx-auto"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className={`${category.color} text-white`}>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl text-white">
                    {currentLanguage === 'en' ? category.title : category.titlePl}
                  </CardTitle>
                  <category.icon className="h-8 w-8 text-white/80" />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{category.count} {t('common.events')}</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="default"
                  className="w-full"
                  onClick={() => navigate(`/accreditation-events/${category.id}`)}
                >
                  {t('common.viewEvents')}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-10 bg-muted rounded-lg p-6 shadow-sm max-w-2xl mx-auto">
          <h2 className="font-semibold text-xl mb-2">{t('common.needHelp')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('common.contactSupport')}
          </p>
          <Button variant="outline">
            {t('common.contactUs')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccreditationCategories;

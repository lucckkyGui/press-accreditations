
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Target, Award, Zap, Globe, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const values = [
  {
    icon: Zap,
    title: "Prostota",
    description: "Tworzymy narzędzia, które są intuicyjne i łatwe w użyciu dla każdego."
  },
  {
    icon: Shield,
    title: "Bezpieczeństwo",
    description: "Dane naszych klientów są chronione najnowszymi standardami bezpieczeństwa."
  },
  {
    icon: Users,
    title: "Współpraca",
    description: "Wierzymy w siłę zespołu i wspólnego osiągania celów."
  },
  {
    icon: Globe,
    title: "Innowacja",
    description: "Nieustannie rozwijamy nasze produkty, aby sprostać wyzwaniom przyszłości."
  }
];

const team = [
  {
    name: "Anna Kowalska",
    role: "CEO & Founder",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"
  },
  {
    name: "Piotr Nowak",
    role: "CTO",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
  },
  {
    name: "Maria Wiśniewska",
    role: "Head of Product",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop"
  },
  {
    name: "Tomasz Zieliński",
    role: "Lead Developer",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop"
  }
];

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container py-4">
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={() => navigate("/home")}
          >
            <ArrowLeft className="h-4 w-4" />
            Powrót
          </Button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
          <div className="container text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Tworzymy przyszłość
              <br />
              <span className="text-primary">zarządzania wydarzeniami</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Press Accreditations to platforma stworzona przez pasjonatów eventów, 
              dla profesjonalistów, którzy chcą organizować wydarzenia na najwyższym poziomie.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Target className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Nasza misja</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  Naszą misją jest uproszczenie procesu zarządzania wydarzeniami i akredytacjami, 
                  aby organizatorzy mogli skupić się na tym, co najważniejsze - tworzeniu 
                  niezapomnianych doświadczeń dla uczestników.
                </p>
                <p className="text-muted-foreground">
                  Wierzymy, że technologia powinna ułatwiać życie, a nie je komplikować. 
                  Dlatego tworzymy narzędzia, które są intuicyjne, wydajne i niezawodne.
                </p>
              </div>
              <Card className="bg-primary/5 border-0">
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 gap-6 text-center">
                    <div>
                      <p className="text-4xl font-bold text-primary">500+</p>
                      <p className="text-muted-foreground">Wydarzeń</p>
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-primary">50k+</p>
                      <p className="text-muted-foreground">Gości</p>
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-primary">99.9%</p>
                      <p className="text-muted-foreground">Uptime</p>
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-primary">24/7</p>
                      <p className="text-muted-foreground">Wsparcie</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Award className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Nasze wartości</h2>
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Wartości, które kierują naszą pracą każdego dnia
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, idx) => {
                const Icon = value.icon;
                return (
                  <Card key={idx} className="text-center">
                    <CardHeader>
                      <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{value.description}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Users className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Nasz zespół</h2>
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Poznaj ludzi, którzy tworzą Press Accreditations
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, idx) => (
                <Card key={idx} className="text-center overflow-hidden">
                  <CardContent className="pt-6">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    />
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">Gotowy, aby dołączyć?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Dołącz do setek organizatorów, którzy już korzystają z Press Accreditations
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => navigate("/auth/register")}
              >
                Rozpocznij za darmo
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => navigate("/contact")}
              >
                Skontaktuj się
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container text-center text-muted-foreground">
          <p>© 2025 Press Accreditations. Wszelkie prawa zastrzeżone.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;

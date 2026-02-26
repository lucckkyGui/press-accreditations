import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, Star, MessageCircle } from "lucide-react";

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
  avatarColor: string;
}

const Testimonial = ({ quote, author, role, company, rating, avatarColor }: TestimonialProps) => (
  <Card className="bg-card border rounded-2xl p-6 shadow-soft h-full hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
    <CardContent className="p-0 space-y-4">
      <div className="flex items-center justify-between">
        <Quote className="h-5 w-5 text-primary/40" />
        <div className="flex gap-0.5">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
          ))}
        </div>
      </div>
      <p className="text-muted-foreground leading-relaxed">{quote}</p>
      <div className="flex items-center gap-3 pt-2">
        <Avatar className="h-10 w-10">
          <AvatarFallback className={`${avatarColor} text-white font-semibold text-xs`}>
            {author.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm">{author}</p>
          <p className="text-xs text-muted-foreground">{role}, {company}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const TestimonialsSection = () => {
  const testimonials: TestimonialProps[] = [
    {
      quote: "Wysłaliśmy 2000 zaproszeń w kilka minut zamiast kilku dni. System szablonów jest niesamowicie intuicyjny — nasz zespół zaczął działać od razu.",
      author: "Marta Wiśniewska",
      role: "Dyrektor ds. eventów",
      company: "TechConf Polska",
      rating: 5,
      avatarColor: "gradient-primary",
    },
    {
      quote: "Skanowanie QR offline uratowało naszą konferencję, gdy padło WiFi. Check-iny szły bez przerwy, a dane zsynchronizowały się automatycznie.",
      author: "Jakub Kowalczyk",
      role: "Dyrektor PR",
      company: "MediaFirst",
      rating: 5,
      avatarColor: "gradient-secondary",
    },
    {
      quote: "Nareszcie system, który jest naprawdę prosty. Całą galę — listę gości, zaproszenia, check-in — skonfigurowałam w niecałą godzinę.",
      author: "Anna Lewandowska",
      role: "CEO",
      company: "EventPro Solutions",
      rating: 5,
      avatarColor: "gradient-warm",
    }
  ];

  return (
    <section className="py-20 bg-muted/40">
      <div className="container">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
            <MessageCircle className="h-4 w-4 text-secondary" />
            <span className="text-sm font-semibold text-secondary">Opinie</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Zaufali nam organizatorzy wydarzeń
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Zobacz, dlaczego profesjonaliści wybierają Press Accreditations
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Testimonial key={index} {...testimonial} />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-6 flex-wrap justify-center bg-card rounded-full px-8 py-4 shadow-soft border">
            <div className="text-center">
              <span className="font-extrabold text-lg gradient-text">500+</span>
              <span className="text-muted-foreground text-sm ml-1">wydarzeń</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="text-center">
              <span className="font-extrabold text-lg gradient-text">100K+</span>
              <span className="text-muted-foreground text-sm ml-1">zaproszeń</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="text-center">
              <span className="font-extrabold text-lg gradient-text">50K+</span>
              <span className="text-muted-foreground text-sm ml-1">check-inów</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, Star } from "lucide-react";

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
}

const Testimonial = ({ quote, author, role, company, rating }: TestimonialProps) => (
  <Card className="bg-background border rounded-xl p-6 shadow-sm h-full hover:shadow-lg transition-all duration-300">
    <CardContent className="p-0 space-y-4">
      <div className="flex items-center justify-between">
        <Quote className="h-5 w-5 text-primary/60" />
        <div className="flex gap-0.5">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          ))}
        </div>
      </div>
      <p className="text-muted-foreground leading-relaxed">{quote}</p>
      <div className="flex items-center gap-3 pt-2">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
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
      rating: 5
    },
    {
      quote: "Skanowanie QR offline uratowało naszą konferencję, gdy padło WiFi. Check-iny szły bez przerwy, a dane zsynchronizowały się automatycznie.",
      author: "Jakub Kowalczyk",
      role: "Dyrektor PR",
      company: "MediaFirst",
      rating: 5
    },
    {
      quote: "Nareszcie system, który jest naprawdę prosty. Całą galę — listę gości, zaproszenia, check-in — skonfigurowałam w niecałą godzinę.",
      author: "Anna Lewandowska",
      role: "CEO",
      company: "EventPro Solutions",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-14">
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
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">500+</span> wydarzeń • 
            <span className="font-semibold text-foreground"> 100 000+</span> zaproszeń • 
            <span className="font-semibold text-foreground"> 50 000+</span> check-inów
          </p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

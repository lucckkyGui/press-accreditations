
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  image?: string;
}

const Testimonial = ({ quote, author, role, company, image }: TestimonialProps) => (
  <Card className="bg-background border rounded-lg p-6 shadow-sm h-full hover:shadow-md transition-all duration-300">
    <CardContent className="p-0 space-y-4">
      <div className="text-primary/80 mb-2">
        <Quote className="h-6 w-6" />
      </div>
      <p className="italic text-muted-foreground mb-4">{quote}</p>
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={image} alt={author} />
          <AvatarFallback>{author.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{author}</p>
          <p className="text-sm text-muted-foreground">{role}, {company}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "Press Acreditations znacznie usprawnił proces zarządzania akredytacjami na naszych konferencjach. Oszczędzamy mnóstwo czasu dzięki automatyzacji.",
      author: "Anna Kowalska",
      role: "Event Manager",
      company: "TechConf",
      image: "/placeholder.svg"
    },
    {
      quote: "Praca w trybie offline to zbawienie podczas wydarzeń z słabym zasięgiem. System działa bezbłędnie i synchronizuje dane po odzyskaniu połączenia.",
      author: "Piotr Nowak",
      role: "PR Director",
      company: "MediaGroup",
      image: "/placeholder.svg"
    },
    {
      quote: "Statystyki i raporty dają nam cenny wgląd w nasze wydarzenia. Teraz dokładnie wiemy, które sesje cieszą się największym zainteresowaniem.",
      author: "Marta Lewandowska",
      role: "CEO",
      company: "EventPro",
      image: "/placeholder.svg"
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Co mówią nasi klienci</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Poznaj opinie osób korzystających z naszego systemu akredytacji
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Testimonial 
              key={index}
              quote={testimonial.quote} 
              author={testimonial.author}
              role={testimonial.role}
              company={testimonial.company}
              image={testimonial.image}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

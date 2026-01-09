
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, Star } from "lucide-react";

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  image?: string;
  rating: number;
}

const Testimonial = ({ quote, author, role, company, image, rating }: TestimonialProps) => (
  <Card className="bg-background border rounded-xl p-6 shadow-sm h-full hover:shadow-lg transition-all duration-300">
    <CardContent className="p-0 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-primary/80">
          <Quote className="h-6 w-6" />
        </div>
        <div className="flex gap-0.5">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
      </div>
      <p className="text-muted-foreground leading-relaxed">{quote}</p>
      <div className="flex items-center gap-3 pt-2">
        <Avatar>
          <AvatarImage src={image} alt={author} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {author.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{author}</p>
          <p className="text-sm text-muted-foreground">{role}, {company}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "We sent 2,000 invitations in minutes instead of days. The template system is incredibly intuitive — our team was up and running in no time.",
      author: "Sarah Mitchell",
      role: "Event Director",
      company: "TechConf Global",
      image: "/placeholder.svg",
      rating: 5
    },
    {
      quote: "The offline QR scanning saved our conference when WiFi went down. Check-ins continued seamlessly, and everything synced automatically afterwards.",
      author: "James Chen",
      role: "PR Director",
      company: "MediaFirst",
      image: "/placeholder.svg",
      rating: 5
    },
    {
      quote: "Finally, a system that's actually simple. I set up our entire gala event — guest list, custom invitations, check-in — in under an hour.",
      author: "Emma Rodriguez",
      role: "CEO",
      company: "EventPro Solutions",
      image: "/placeholder.svg",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by Event Professionals
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See why organizers choose Press Accreditations for their events
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
              rating={testimonial.rating}
            />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">500+</span> events managed • 
            <span className="font-semibold text-foreground"> 100,000+</span> invitations sent • 
            <span className="font-semibold text-foreground"> 50,000+</span> successful check-ins
          </p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;


import React from "react";

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  company: string;
}

const Testimonial = ({ quote, author, role, company }: TestimonialProps) => (
  <div className="bg-background border rounded-lg p-6 shadow-sm">
    <p className="italic text-muted-foreground mb-4">{quote}</p>
    <div>
      <p className="font-medium">{author}</p>
      <p className="text-sm text-muted-foreground">{role}, {company}</p>
    </div>
  </div>
);

const TestimonialsSection = () => (
  <section className="py-16 bg-muted/30">
    <div className="container">
      <h2 className="text-3xl font-bold text-center mb-12">Co mówią nasi klienci</h2>
      <div className="grid md:grid-cols-3 gap-8">
        <Testimonial 
          quote="Press Acreditations znacznie usprawnił proces zarządzania akredytacjami na naszych konferencjach. Oszczędzamy mnóstwo czasu dzięki automatyzacji." 
          author="Anna Kowalska"
          role="Event Manager"
          company="TechConf"
        />
        <Testimonial 
          quote="Praca w trybie offline to zbawienie podczas wydarzeń z słabym zasięgiem. System działa bezbłędnie i synchronizuje dane po odzyskaniu połączenia." 
          author="Piotr Nowak"
          role="PR Director"
          company="MediaGroup"
        />
        <Testimonial 
          quote="Statystyki i raporty dają nam cenny wgląd w nasze wydarzenia. Teraz dokładnie wiemy, które sesje cieszą się największym zainteresowaniem." 
          author="Marta Lewandowska"
          role="CEO"
          company="EventPro"
        />
      </div>
    </div>
  </section>
);

export default TestimonialsSection;

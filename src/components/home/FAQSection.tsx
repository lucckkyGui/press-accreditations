
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqItems = [
  {
    question: "How quickly can I set up the system?",
    answer: "You can be up and running in under 5 minutes. Simply create an account, add your event details, upload your guest list (CSV or manual entry), and start sending invitations. No technical knowledge required — our intuitive interface guides you through every step."
  },
  {
    question: "How does the invitation system work?",
    answer: "Our smart invitation system is incredibly simple: 1) Choose from professional email templates or create your own, 2) Import your guest list, 3) Click send. Each invitation includes a unique QR code for check-in. You can track opens, sends, and responses in real-time from your dashboard."
  },
  {
    question: "Can I customize invitation templates?",
    answer: "Absolutely! We provide beautiful pre-designed templates for conferences, galas, press events, and more. You can fully customize colors, logos, text, and layout to match your brand. Templates are saved for future events — set up once, reuse forever."
  },
  {
    question: "What about bulk invitations?",
    answer: "Send thousands of personalized invitations with a single click. Our system handles email delivery, tracks bounces, and automatically retries failed sends. You can schedule sends for optimal delivery times and segment your guest list for targeted communications."
  },
  {
    question: "How does QR code verification work?",
    answer: "Each guest receives a unique QR code in their invitation. At your event, simply use our mobile scanner app (or any smartphone camera) to scan codes. Check-in takes less than 2 seconds — even offline. Data syncs automatically when connection is restored."
  },
  {
    question: "Is the system secure?",
    answer: "Enterprise-grade security is built-in. We use AES-256 encryption, secure cloud hosting, and GDPR-compliant data handling. Each QR code is cryptographically unique and impossible to duplicate. Access controls let you define exactly who sees what."
  },
  {
    question: "What integrations are available?",
    answer: "Connect with your existing tools: Google Calendar, Outlook, Slack, and popular CRM systems. Export data in multiple formats (CSV, Excel, PDF). Our API allows custom integrations for enterprise needs."
  },
  {
    question: "Do I need to install any software?",
    answer: "No installation required! Press Accreditations is fully web-based and works on any device with a browser. For event check-in, our Progressive Web App works offline on mobile devices — just add it to your home screen."
  }
];

const FAQSection = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Everything you need to know about Press Accreditations. 
            Can't find what you're looking for? <a href="/contact" className="text-primary hover:underline">Contact our team</a>.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqItems.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-background border rounded-lg px-6 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left text-base md:text-lg font-medium hover:no-underline py-5">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;

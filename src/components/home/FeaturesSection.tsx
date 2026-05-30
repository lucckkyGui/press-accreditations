import React from "react";
import {
  Calendar, Users, QrCode, BarChart3, Mail, Shield, Smartphone, Zap, Globe
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: QrCode,
    title: "Skanowanie QR",
    description: "Weryfikacja gości w 2 sekundy. Działa offline — synchronizuje się automatycznie po połączeniu.",
    colorClass: "bg-primary/10 text-primary",
  },
  {
    icon: Mail,
    title: "Automatyczny mailing",
    description: "Spersonalizowane zaproszenia z kodem QR dla tysięcy gości. Jedno kliknięcie — wysyłka gotowa.",
    colorClass: "bg-info/10 text-info",
  },
  {
    icon: Users,
    title: "Zarządzanie gośćmi",
    description: "Import CSV, strefy dostępu, statusy, historia zmian. Pełna kontrola nad listą gości.",
    colorClass: "bg-secondary/10 text-secondary",
  },
  {
    icon: BarChart3,
    title: "Analityka na żywo",
    description: "Dashboard real-time: frekwencja, check-in, raporty dla sponsorów — wszystko w jednym widoku.",
    colorClass: "bg-primary/10 text-primary",
  },
  {
    icon: Calendar,
    title: "Multi-event",
    description: "Zarządzaj wieloma wydarzeniami jednocześnie. Kopiuj ustawienia i listy gości między eventami.",
    colorClass: "bg-destructive/10 text-destructive",
  },
  {
    icon: Shield,
    title: "Bezpieczeństwo & RODO",
    description: "Szyfrowanie danych, kontrola dostępu, audit log i pełna zgodność z RODO.",
    colorClass: "bg-success/10 text-success",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-background grid-bg-sm relative overflow-hidden">
      {/* Subtle aurora at corners */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-[400px] h-[400px] bg-primary/8 rounded-full blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 w-[320px] h-[320px] bg-secondary/8 rounded-full blur-[100px]" />

      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <div className="chip chip-acc mx-auto mb-6">
            <span className="chip-dot" />
            <Zap className="h-3 w-3" />
            Funkcjonalności
          </div>

          <h2 className="display text-3xl md:text-4xl mb-4">
            Wszystko czego potrzebujesz
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Kompleksowe narzędzia do zarządzania akredytacjami i gośćmi
            na wydarzeniach każdej skali.
          </p>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={cardVariants}>
              <div className="card-glow group h-full p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover cursor-default">
                <div className={`inline-flex p-2.5 rounded-lg mb-5 ${feature.colorClass}`}>
                  <feature.icon className="h-5 w-5" />
                </div>

                <h3 className="text-[15px] font-semibold mb-2 text-foreground group-hover:text-primary transition-colors duration-150">
                  {feature.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom trust strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.25 }}
          className="mt-14 flex items-center justify-center gap-8 flex-wrap"
        >
          {[
            { icon: Smartphone, label: "PWA Ready",      color: "text-primary" },
            { icon: Globe,      label: "10 języków",     color: "text-secondary" },
            { icon: Zap,        label: "Real-time sync", color: "text-primary" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-muted-foreground text-sm">
              <item.icon className={`h-4 w-4 ${item.color}`} />
              <span>{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;

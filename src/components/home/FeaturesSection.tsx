import React from "react";
import {
  Calendar, Users, QrCode, BarChart3, Mail, Shield, Smartphone, Zap, Globe
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Shield,
    title: "Media verification",
    description: "Scoring i flagi ryzyka dla każdego zgłoszenia mediów. System sugeruje — decyzję podejmuje PR manager.",
    colorClass: "bg-primary/10 text-primary",
  },
  {
    icon: Mail,
    title: "Akredytacja + QR pass",
    description: "Decyzja (approved / limited / rejected / waitlist) tworzy QR pass i wysyła e-mail z linkiem do passu.",
    colorClass: "bg-info/10 text-info",
  },
  {
    icon: QrCode,
    title: "QR check-in (offline)",
    description: "Skan na bramce w <2 s, 7 jasnych statusów. Działa offline — synchronizuje się po odzyskaniu sieci.",
    colorClass: "bg-secondary/10 text-secondary",
  },
  {
    icon: BarChart3,
    title: "Media Coverage Report",
    description: "Raport dla sponsora: funnel, frekwencja, coverage, wzmianki sponsora, top publikacje. PDF + CSV.",
    colorClass: "bg-primary/10 text-primary",
  },
  {
    icon: Users,
    title: "Media CRM",
    description: "Baza kontaktów i mediów z historią, ratingiem, no-show i coverage rate — do kolejnych wydarzeń.",
    colorClass: "bg-destructive/10 text-destructive",
  },
  {
    icon: Calendar,
    title: "Coverage collection",
    description: "Secure linki dla dziennikarzy, automatyczne reminders (24h/72h/7d), board statusów coverage.",
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
            Cały workflow media operations
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Od zgłoszenia dziennikarza po raport wartości medialnej dla sponsora —
            jedno narzędzie dla biura prasowego.
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

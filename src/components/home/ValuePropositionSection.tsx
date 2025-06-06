
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Shield, Fingerprint, TrendingUp, Zap, Star, ArrowRight } from 'lucide-react';

const ValuePropositionSection: React.FC = () => {
  const features = [
    {
      icon: <Brain className="h-8 w-8 text-blue-600" />,
      title: "AI-First Fraud Detection",
      subtitle: "Zaawansowana detekcja fraudu",
      description: "Algorytmy sztucznej inteligencji automatycznie wykrywają podejrzane wzorce rejestracji i próby oszustw w czasie rzeczywistym.",
      accuracy: "94.2%",
      metric: "dokładność wykrywania",
      features: [
        "Analiza wzorców zachowań",
        "Detekcja duplikatów w czasie rzeczywistym", 
        "Automatyczne blokowanie podejrzanych kont",
        "Machine learning z każdym wydarzeniem"
      ],
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-600" />,
      title: "Blockchain Credentials",
      subtitle: "Bezpieczne cyfrowe akredytacje",
      description: "Akredytacje zabezpieczone technologią blockchain są niemożliwe do sfałszowania i weryfikowalne w czasie rzeczywistym.",
      accuracy: "100%",
      metric: "bezpieczeństwo weryfikacji",
      features: [
        "Niemożliwe do sfałszowania certyfikaty",
        "Publiczna weryfikacja w blockchain",
        "Smart contracts dla automatyzacji",
        "Decentralized identity management"
      ],
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Fingerprint className="h-8 w-8 text-green-600" />,
      title: "Biometric Verification",
      subtitle: "Najnowocześniejsze zabezpieczenia",
      description: "Weryfikacja biometryczna wykorzystująca rozpoznawanie twarzy, odciski palców i skan tęczówki dla maksymalnego bezpieczeństwa.",
      accuracy: "99.8%",
      metric: "dokładność weryfikacji",
      features: [
        "Rozpoznawanie twarzy 3D",
        "Skanowanie odcisków palców",
        "Analiza tęczówki oka",
        "Multi-factor biometric authentication"
      ],
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-orange-600" />,
      title: "Predictive Analytics",
      subtitle: "Przewidywanie uczestnictwa AI",
      description: "Zaawansowana analityka predykcyjna przewiduje frekwencję, identyfikuje ryzyko i optymalizuje procesy wydarzeń.",
      accuracy: "87%",
      metric: "trafność prognoz",
      features: [
        "Prognozowanie frekwencji w czasie rzeczywistym",
        "Analiza ryzyka bezpieczeństwa",
        "Optymalizacja przepływu gości",
        "Behavioral pattern recognition"
      ],
      gradient: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            <Star className="h-4 w-4 mr-2" />
            AI-First Platform
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Unikalna Propozycja Wartości
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Jedyna platforma akredytacyjna na świecie łącząca zaawansowaną sztuczną inteligencję, 
            technologię blockchain, weryfikację biometryczną i analitykę predykcyjną w jednym rozwiązaniu.
          </p>
        </div>

        {/* Stats Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-16 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">94.2%</div>
              <div className="text-blue-100">AI Accuracy</div>
            </div>
            <div>
              <div className="text-3xl font-bold">100%</div>
              <div className="text-blue-100">Blockchain Security</div>
            </div>
            <div>
              <div className="text-3xl font-bold">99.8%</div>
              <div className="text-blue-100">Biometric Precision</div>
            </div>
            <div>
              <div className="text-3xl font-bold">87%</div>
              <div className="text-blue-100">Prediction Accuracy</div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="group relative overflow-hidden border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-2xl">
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <CardHeader className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-lg">
                    {feature.icon}
                  </div>
                  <Badge variant="secondary" className="ml-4">
                    <Zap className="h-3 w-3 mr-1" />
                    {feature.accuracy} {feature.metric}
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-bold mb-2">{feature.title}</CardTitle>
                <p className="text-primary font-medium">{feature.subtitle}</p>
              </CardHeader>
              
              <CardContent className="relative">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="space-y-3">
                  {feature.features.map((item, idx) => (
                    <div key={idx} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-gradient-to-r from-primary to-primary/60 rounded-full mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Why We're Different */}
        <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Dlaczego jesteśmy wyjątkowi?</h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Podczas gdy konkurencja oferuje podstawowe funkcje, my dostarczamy przyszłość akredytacji
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h4 className="text-2xl font-bold mb-6 text-gray-800">Tradycyjne platformy:</h4>
              <div className="space-y-4">
                {[
                  "Podstawowe zarządzanie gośćmi",
                  "Statyczne raportowanie",
                  "Manualna weryfikacja dokumentów",
                  "Brak analizy predykcyjnej",
                  "Standardowe zabezpieczenia"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center text-gray-500">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded mr-3" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Nasza platforma AI-First:
              </h4>
              <div className="space-y-4">
                {[
                  "AI-powered fraud detection w czasie rzeczywistym",
                  "Blockchain-secured credentials",
                  "Automatyczna weryfikacja biometryczna",
                  "Predictive analytics i forecasting",
                  "Enterprise-grade security + AI"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center text-gray-800">
                    <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-blue-500 rounded mr-3 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3">
              Zobacz demo AI-First Platform
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValuePropositionSection;

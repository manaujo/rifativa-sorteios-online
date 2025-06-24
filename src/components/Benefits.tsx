
import { Shield, Zap, Users, TrendingUp, Heart, CheckCircle } from "lucide-react";

const Benefits = () => {
  const benefits = [
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Criação Rápida",
      description: "Configure sua rifa ou campanha em menos de 5 minutos"
    },
    {
      icon: <Shield className="w-8 h-8 text-green-500" />,
      title: "100% Seguro",
      description: "Pagamentos via PIX com total segurança e transparência"
    },
    {
      icon: <Users className="w-8 h-8 text-blue-500" />,
      title: "Alcance Máximo",
      description: "Compartilhe facilmente e alcance milhares de pessoas"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-purple-500" />,
      title: "Relatórios Completos",
      description: "Acompanhe vendas, participantes e performance em tempo real"
    },
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: "Para Causas Nobres",
      description: "Ideal para ONGs, tratamentos médicos e projetos sociais"
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-emerald-500" />,
      title: "Suporte Total",
      description: "Equipe especializada para te ajudar a alcançar seus objetivos"
    }
  ];

  return (
    <section id="beneficios" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Por que escolher o <span className="gradient-text">Rifativa</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A plataforma mais completa e confiável para suas rifas e campanhas de arrecadação
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="bg-gray-50 rounded-2xl p-8 text-center card-hover animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-4 flex justify-center">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                {benefit.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;


import { UserPlus, PlusCircle, Share2, DollarSign } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: <UserPlus className="w-8 h-8 text-white" />,
      title: "1. Crie sua conta",
      description: "Cadastre-se gratuitamente e escolha o plano ideal para você"
    },
    {
      icon: <PlusCircle className="w-8 h-8 text-white" />,
      title: "2. Configure sua rifa",
      description: "Defina prêmios, valores dos bilhetes e adicione fotos atrativas"
    },
    {
      icon: <Share2 className="w-8 h-8 text-white" />,
      title: "3. Compartilhe",
      description: "Divulgue nas redes sociais e para seus contatos"
    },
    {
      icon: <DollarSign className="w-8 h-8 text-white" />,
      title: "4. Receba via PIX",
      description: "Os pagamentos caem direto na sua conta via PIX"
    }
  ];

  return (
    <section id="como-funciona" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
            Como <span className="gradient-text">funciona</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Em apenas 4 passos simples você pode começar a arrecadar dinheiro com suas rifas
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="bg-gradient-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              🎯 Dica Pro
            </h3>
            <p className="text-gray-600 text-lg">
              Use fotos de alta qualidade dos prêmios e descreva detalhadamente os benefícios. 
              Rifas com boa apresentação vendem até <strong>300% mais bilhetes</strong>!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Heart, Users, BookOpen, Globe } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-8 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <p className="text-primary tracking-widest uppercase text-xs font-semibold mb-2">Conheça</p>
          <h1 className="font-display text-4xl font-bold text-secondary-foreground mb-4">Sobre Nós</h1>
          <p className="text-secondary-foreground/70 max-w-xl mx-auto">
            Somos Movidos Por Amor. Uma igreja comprometida com a Palavra, oração, adoração, comunhão, unidade, discipulado e amor.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="prose prose-lg text-foreground/80 mx-auto">
          <h2 className="font-display text-2xl font-bold text-foreground">Nossa Missão</h2>
          <p>
            Ser uma igreja formada por autênticos discípulos de Cristo e comprometida com a implantação do Reino de Deus em todas as esferas da sociedade. Temos a missão de alcançar vidas pela pregação do evangelho e cuidar bem delas por meio do discipulado.
          </p>
          <p>
            Estamos firmados sobre os alicerces da igreja do primeiro século: Palavra, oração, adoração, comunhão, unidade, discipulado e amor.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
          {[
            { icon: Heart, title: "Amor Genuíno", desc: "O amor é o fundamento de tudo que fazemos como corpo de Cristo." },
            { icon: Users, title: "Família Espiritual", desc: "Somos uma família que acolhe, cuida e cresce junto." },
            { icon: BookOpen, title: "Palavra de Deus", desc: "Nosso ensino é firmado na verdade das Escrituras." },
            { icon: Globe, title: "Impacto Social", desc: "Transformando vidas e comunidades ao redor." },
          ].map((item) => (
            <div key={item.title} className="bg-card rounded-xl p-6 shadow-card border border-border/50">
              <item.icon className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-display font-semibold text-lg text-foreground mb-1">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;

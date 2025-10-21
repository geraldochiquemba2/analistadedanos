import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScanSearch, Shield, Zap, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

export default function WelcomePage() {
  const [, setLocation] = useLocation();

  return (
    <div 
      className="min-h-screen w-full relative"
      style={{
        backgroundImage: 'url(https://siccseguros.com.br/wp-content/uploads/2024/01/001a-24_SICCS_seguro-novo.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
      
      <header className="border-b border-white/10 bg-black/20 backdrop-blur relative z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanSearch className="h-6 w-6 text-white" />
            <span className="font-semibold text-lg text-white">Análise de Danos</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative container mx-auto px-4 py-16 z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              Bem-vindo ao Sistema de
              <span className="text-primary"> Análise de Danos</span>
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Ferramenta inteligente para análise e avaliação de danos em ativos.
              Faça upload de imagens e receba análises detalhadas em segundos.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={() => setLocation("/app")}
              className="gap-2 bg-primary/90 backdrop-blur hover:bg-primary"
              data-testid="button-start"
            >
              Começar Análise
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-12">
            <Card data-testid="card-feature-fast" className="bg-white/10 dark:bg-white/5 backdrop-blur-lg border-white/20">
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-center">
                  <div className="h-14 w-14 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 shadow-inner">
                    <Zap className="h-7 w-7 text-white" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="font-semibold text-lg text-white">Análise Rápida</h3>
                <p className="text-sm text-white/80">
                  Resultados precisos em questão de segundos utilizando inteligência artificial avançada.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-accurate" className="bg-white/10 dark:bg-white/5 backdrop-blur-lg border-white/20">
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-center">
                  <div className="h-14 w-14 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 shadow-inner">
                    <ScanSearch className="h-7 w-7 text-white" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="font-semibold text-lg text-white">Detecção Precisa</h3>
                <p className="text-sm text-white/80">
                  Identificação detalhada de danos com análise visual e avaliação de severidade.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-secure" className="bg-white/10 dark:bg-white/5 backdrop-blur-lg border-white/20">
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-center">
                  <div className="h-14 w-14 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 shadow-inner">
                    <Shield className="h-7 w-7 text-white" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="font-semibold text-lg text-white">Histórico Seguro</h3>
                <p className="text-sm text-white/80">
                  Todas as análises são salvas e podem ser acessadas a qualquer momento.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 relative z-10">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-white/60">
            Sistema de Análise de Danos © 2025
          </p>
        </div>
      </footer>
    </div>
  );
}

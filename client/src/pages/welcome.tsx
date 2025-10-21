import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScanSearch, Shield, Zap, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

export default function WelcomePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanSearch className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">Análise de Danos</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Bem-vindo ao Sistema de
              <span className="text-primary"> Análise de Danos</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ferramenta inteligente para análise e avaliação de danos em ativos.
              Faça upload de imagens e receba análises detalhadas em segundos.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={() => setLocation("/app")}
              className="gap-2"
              data-testid="button-start"
            >
              Começar Análise
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-12">
            <Card data-testid="card-feature-fast">
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg">Análise Rápida</h3>
                <p className="text-sm text-muted-foreground">
                  Resultados precisos em questão de segundos utilizando inteligência artificial avançada.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-accurate">
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                    <ScanSearch className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg">Detecção Precisa</h3>
                <p className="text-sm text-muted-foreground">
                  Identificação detalhada de danos com análise visual e avaliação de severidade.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-secure">
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg">Histórico Seguro</h3>
                <p className="text-sm text-muted-foreground">
                  Todas as análises são salvas e podem ser acessadas a qualquer momento.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-muted-foreground">
            Sistema de Análise de Danos © 2025
          </p>
        </div>
      </footer>
    </div>
  );
}

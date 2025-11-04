import React from 'react';
import { StoreList } from '@/pages/public/StoreList';
import { ArrowRight, Store } from 'lucide-react';

export const StoreFront: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="container py-16 text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold">
              Venda Fácil
              teste
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto">
              Conectando você aos melhores sabores da sua região
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center gap-2 text-primary-foreground/80">
              <Store className="h-5 w-5" />
              <span>Múltiplas lojas disponíveis</span>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/80">
              <ArrowRight className="h-5 w-5" />
              <span>Entrega rápida e segura</span>
            </div>
          </div>
        </div>
      </div>

      {/* Store List */}
      <div className="container py-12">
        <StoreList />
      </div>

      {/* Footer Info */}
      <div className="bg-muted/50 border-t">
        <div className="container py-8 text-center">
          <p className="text-muted-foreground">
            Plataforma multi-empresas • Sistema preparado para subdomínios personalizados
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Futuro: nomedaloja.vendafacil.com.br
          </p>
        </div>
      </div>
    </div>
  );
};
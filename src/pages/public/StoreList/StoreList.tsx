import React from 'react';
import { Link } from 'react-router-dom';
import { useStoreContext } from '@/contexts';
import { Badge, Button, Card, Avatar, AvatarFallback } from '@/components/ui';
import { Star, Clock, Truck, MapPin } from 'lucide-react';

export const StoreList: React.FC = () => {
  const { stores, storeLoading } = useStoreContext();

  if (storeLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Lojas Disponíveis</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-muted rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
                <div className="h-10 bg-muted rounded" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Escolha sua loja</h1>
        <p className="text-muted-foreground">
          Descubra sabores incríveis das melhores lojas da região
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => (
          <Card key={store.id} className="group hover:shadow-lg transition-all duration-200">
            <div className="p-6 space-y-4">
              {/* Header da loja */}
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback 
                    className="text-lg"
                    style={{ backgroundColor: `${store.theme.primaryColor}20` }}
                  >
                    {store.avatar}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                    {store.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {store.category}
                  </p>
                  
                  {/* Rating e reviews */}
                  {store.rating > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{store.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({store.reviewCount}+ avaliações)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Descrição */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {store.description}
              </p>

              {/* Informações de entrega */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{store.settings.deliveryTime}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>R$ {store.settings.deliveryFee.toFixed(2)}</span>
                  </div>
                </div>

                {store.settings.freeDeliveryAbove > 0 && (
                  <Badge variant="secondary" className="w-full justify-center gap-1">
                    <Truck className="h-3 w-3" />
                    Grátis acima de R$ {store.settings.freeDeliveryAbove.toFixed(2)}
                  </Badge>
                )}
              </div>

              {/* Botão de ação */}
              <Button 
                asChild 
                className="w-full"
                style={{ backgroundColor: store.theme.primaryColor }}
              >
                <Link to={`/loja/${store.id}`}>
                  Ver Cardápio
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {stores.length === 0 && !storeLoading && (
        <div className="text-center py-12">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Nenhuma loja disponível</h3>
            <p className="text-muted-foreground">
              Não há lojas ativas no momento. Tente novamente mais tarde.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

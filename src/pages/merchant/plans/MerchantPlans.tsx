/**
 * Página de planos do merchant
 * Exibe o plano atual e outros planos disponíveis para upgrade
 */

import React, { useState } from 'react';
import { 
  CreditCard, 
  Check, 
  X, 
  Zap, 
  Crown, 
  Rocket,
  Star,
  TrendingUp,
  Shield,
  Headphones,
  BarChart3,
  Users,
  Package,
  ShoppingCart
} from 'lucide-react';
import { MerchantLayout } from '@/components/layout/MerchantLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/cards';
import { Button } from '@/components/ui/buttons';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/shared/LoadingState';
import { useMerchantAuth } from '@/hooks/useMerchantAuth';
import { showSuccessToast, showInfoToast } from '@/utils/toast';
import { cn } from '@/utils';

// Mock: Plano atual do usuário (será substituído pela API)
const CURRENT_PLAN_MOCK = {
  id: 'basic',
  name: 'Básico',
  price: 49.90,
  billingCycle: 'mensal',
  startDate: '2024-01-15',
  nextBillingDate: '2025-01-15',
  status: 'active',
};

// Definição dos planos disponíveis
const PLANS = [
  {
    id: 'basic',
    name: 'Básico',
    description: 'Perfeito para quem está começando',
    price: 49.90,
    icon: Zap,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    borderColor: 'border-blue-200',
    buttonVariant: 'outline' as const,
    features: [
      { icon: Check, text: 'Até 100 produtos', available: true },
      { icon: Check, text: 'Loja online personalizada', available: true },
      { icon: Check, text: 'Painel de controle básico', available: true },
      { icon: Check, text: 'Suporte por email', available: true },
      { icon: Check, text: 'Relatórios básicos', available: true },
      { icon: X, text: 'Múltiplas lojas', available: false },
      { icon: X, text: 'Integrações avançadas', available: false },
      { icon: X, text: 'Suporte prioritário', available: false },
    ],
    popular: false,
  },
  {
    id: 'professional',
    name: 'Profissional',
    description: 'Para negócios em crescimento',
    price: 99.90,
    icon: Crown,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    borderColor: 'border-purple-400',
    buttonVariant: 'default' as const,
    features: [
      { icon: Check, text: 'Até 500 produtos', available: true },
      { icon: Check, text: 'Loja online personalizada', available: true },
      { icon: Check, text: 'Painel de controle avançado', available: true },
      { icon: Check, text: 'Suporte prioritário', available: true },
      { icon: Check, text: 'Relatórios avançados', available: true },
      { icon: Check, text: 'Até 3 lojas', available: true },
      { icon: Check, text: 'Integrações avançadas', available: true },
      { icon: X, text: 'Gerente de conta dedicado', available: false },
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Para grandes operações',
    price: 180.00,
    icon: Rocket,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
    borderColor: 'border-amber-400',
    buttonVariant: 'default' as const,
    features: [
      { icon: Check, text: 'Produtos ilimitados', available: true },
      { icon: Check, text: 'Lojas ilimitadas', available: true },
      { icon: Check, text: 'Painel de controle premium', available: true },
      { icon: Check, text: 'Suporte prioritário 24/7', available: true },
      { icon: Check, text: 'Relatórios personalizados', available: true },
      { icon: Check, text: 'API personalizada', available: true },
      { icon: Check, text: 'Gerente de conta dedicado', available: true },
      { icon: Check, text: 'Consultoria estratégica', available: true },
    ],
    popular: false,
  },
];

// Estatísticas mock do plano atual
const PLAN_STATS_MOCK = [
  { icon: Package, label: 'Produtos ativos', value: '45 / 100', color: 'text-blue-600' },
  { icon: ShoppingCart, label: 'Pedidos este mês', value: '128', color: 'text-green-600' },
  { icon: Users, label: 'Clientes', value: '89', color: 'text-purple-600' },
  { icon: BarChart3, label: 'Faturamento', value: 'R$ 4.250,00', color: 'text-amber-600' },
];

export const MerchantPlans: React.FC = () => {
  const { merchant } = useMerchantAuth();
  const [loading, setLoading] = useState(false);

  // Mock do plano atual
  const currentPlan = CURRENT_PLAN_MOCK;

  const handleSelectPlan = async (planId: string) => {
    // Se for o plano atual, não faz nada
    if (planId === currentPlan.id) {
      showInfoToast('Você já está no plano ' + PLANS.find(p => p.id === planId)?.name, 'Plano atual');
      return;
    }

    setLoading(true);

    try {
      // Mock: Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // TODO: Aqui vai a chamada real para a API
      // await PlanService.upgradePlan(planId);

      const selectedPlan = PLANS.find(p => p.id === planId);
      showSuccessToast(
        `Você será redirecionado para o pagamento do plano ${selectedPlan?.name}.`,
        'Upgrade de plano'
      );

      // TODO: Redirecionar para página de pagamento
    } catch (error) {
      console.error('Erro ao selecionar plano:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (!merchant) {
    return (
      <MerchantLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingState size="lg" />
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout>
      {/* Overlay de Loading durante seleção de plano */}
      {loading && (
        <LoadingState 
          message="Processando seleção do plano..."
          size="lg"
          fullScreen
        />
      )}

      <div className="max-w-7xl mx-auto space-y-8 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-primary" />
            Planos e Assinaturas
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie seu plano e faça upgrade para desbloquear mais recursos
          </p>
        </div>

        {/* Plano Atual */}
        <Card className="border-2 border-primary shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Seu Plano Atual</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Ativo desde {formatDate(currentPlan.startDate)}
                  </p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 text-sm px-4 py-2">
                <div className="flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  Ativo
                </div>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Info do Plano Atual */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-700 font-medium mb-2">Plano</p>
                <p className="text-3xl font-bold text-blue-900">
                  {PLANS.find(p => p.id === currentPlan.id)?.name}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                <p className="text-sm text-green-700 font-medium mb-2">Valor Mensal</p>
                <p className="text-3xl font-bold text-green-900">
                  R$ {currentPlan.price.toFixed(2)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                <p className="text-sm text-purple-700 font-medium mb-2">Próxima Cobrança</p>
                <p className="text-lg font-bold text-purple-900">
                  {formatDate(currentPlan.nextBillingDate)}
                </p>
              </div>
            </div>

            {/* Estatísticas de Uso */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Estatísticas de Uso
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {PLAN_STATS_MOCK.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div 
                      key={index}
                      className="bg-white border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg">
                          <Icon className={cn('h-5 w-5', stat.color)} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">{stat.label}</p>
                          <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Planos Disponíveis */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Escolha o Plano Ideal para Você
            </h2>
            <p className="text-gray-600">
              Upgrade para desbloquear mais recursos e fazer seu negócio crescer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = plan.id === currentPlan.id;
              
              return (
                <Card
                  key={plan.id}
                  className={cn(
                    'relative overflow-hidden transition-all hover:shadow-xl',
                    plan.popular && 'border-2 border-primary shadow-lg scale-105',
                    isCurrentPlan && 'ring-2 ring-primary ring-offset-2'
                  )}
                >
                  {/* Badge Popular */}
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
                      MAIS POPULAR
                    </div>
                  )}

                  {/* Badge Plano Atual */}
                  {isCurrentPlan && (
                    <div className="absolute top-0 left-0 bg-green-600 text-white px-4 py-1 text-xs font-bold rounded-br-lg flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      SEU PLANO
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div className={cn('inline-flex p-4 rounded-2xl mx-auto mb-4', plan.iconBg)}>
                      <Icon className={cn('h-12 w-12', plan.iconColor)} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-gray-600 text-lg">R$</span>
                      <span className="text-5xl font-bold text-gray-900">
                        {plan.price.toFixed(2).split('.')[0]}
                      </span>
                      <span className="text-gray-600 text-lg">
                        ,{plan.price.toFixed(2).split('.')[1]}
                      </span>
                      <span className="text-gray-500 text-sm">/mês</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Lista de Features */}
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => {
                        const FeatureIcon = feature.icon;
                        return (
                          <li key={index} className="flex items-start gap-3">
                            <div className={cn(
                              'flex-shrink-0 rounded-full p-1',
                              feature.available ? 'bg-green-100' : 'bg-gray-100'
                            )}>
                              <FeatureIcon 
                                className={cn(
                                  'h-4 w-4',
                                  feature.available ? 'text-green-600' : 'text-gray-400'
                                )} 
                              />
                            </div>
                            <span className={cn(
                              'text-sm',
                              feature.available ? 'text-gray-700' : 'text-gray-400'
                            )}>
                              {feature.text}
                            </span>
                          </li>
                        );
                      })}
                    </ul>

                    {/* Botão de Ação */}
                    <Button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={isCurrentPlan || loading}
                      variant={plan.buttonVariant}
                      size="lg"
                      className={cn(
                        'w-full font-semibold',
                        plan.popular && !isCurrentPlan && 'bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700',
                        isCurrentPlan && 'cursor-not-allowed opacity-50'
                      )}
                    >
                      {isCurrentPlan ? (
                        <>
                          <Check className="h-5 w-5 mr-2" />
                          Plano Atual
                        </>
                      ) : plan.price > currentPlan.price ? (
                        <>
                          <TrendingUp className="h-5 w-5 mr-2" />
                          Fazer Upgrade
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5 mr-2" />
                          Selecionar Plano
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Garantias e Benefícios */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Pagamento Seguro</h4>
                  <p className="text-sm text-gray-600">
                    Transações protegidas e criptografadas
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <Headphones className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Suporte Dedicado</h4>
                  <p className="text-sm text-gray-600">
                    Equipe pronta para te ajudar
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <Rocket className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Sem Fidelidade</h4>
                  <p className="text-sm text-gray-600">
                    Cancele quando quiser, sem burocracia
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MerchantLayout>
  );
};


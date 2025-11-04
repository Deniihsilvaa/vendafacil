import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { useCartContext, useStoreContext, useAuthContext } from '@/contexts';
import { Button, Card, CardHeader, CardContent, Badge } from '@/components/ui';
import { InputWithLabel } from '@/components/ui/forms/InputWithLabel';
import { Textarea } from '@/components/ui/forms';
import { ArrowLeft, ShoppingCart, MapPin, CreditCard, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '@/utils';
import type { DeliveryAddress } from '@/types';

type PaymentMethod = 'credit_card' | 'debit_card' | 'pix' | 'cash';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();
  const { items, totalItems, totalAmount, clearCart } = useCartContext();
  const { currentStore } = useStoreContext();
  const { user } = useAuthContext();

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Endereço, 2: Pagamento, 3: Confirmação
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dados do formulário
  const [address, setAddress] = useState<DeliveryAddress>({
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    zipCode: '',
    complement: '',
    reference: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [observations, setObservations] = useState('');

  // Validar se há itens no carrinho
  useEffect(() => {
    if (totalItems === 0) {
      navigate(storeId ? `/loja/${storeId}` : '/');
    }
  }, [totalItems, navigate, storeId]);

  // Calcular taxa de entrega
  const deliveryFee = currentStore?.settings.deliveryFee || 0;
  const freeDeliveryAbove = currentStore?.settings.freeDeliveryAbove || 0;
  const finalDeliveryFee = totalAmount >= freeDeliveryAbove ? 0 : deliveryFee;
  const finalTotal = totalAmount + finalDeliveryFee;

  // Validação do endereço
  const validateAddress = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!address.street.trim()) newErrors.street = 'Rua é obrigatória';
    if (!address.number.trim()) newErrors.number = 'Número é obrigatório';
    if (!address.neighborhood.trim()) newErrors.neighborhood = 'Bairro é obrigatório';
    if (!address.city.trim()) newErrors.city = 'Cidade é obrigatória';
    if (!address.zipCode.trim()) newErrors.zipCode = 'CEP é obrigatório';
    
    // Validar formato do CEP
    const zipCodeRegex = /^\d{5}-?\d{3}$/;
    if (address.zipCode && !zipCodeRegex.test(address.zipCode.replace(/\D/g, ''))) {
      newErrors.zipCode = 'CEP inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Avançar para etapa de pagamento
  const handleNextToPayment = () => {
    if (validateAddress()) {
      setStep(2);
    }
  };

  // Finalizar pedido
  const handleFinalizeOrder = async () => {
    setLoading(true);
    
    try {
      // Simular criação do pedido
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // TODO: Integrar com API para criar pedido
      const orderData = {
        storeId: currentStore?.id,
        items,
        address,
        paymentMethod,
        observations,
        totalAmount: finalTotal,
        deliveryFee: finalDeliveryFee,
      };

      console.log('Pedido criado:', orderData);

      // Limpar carrinho
      clearCart();
      
      // Ir para confirmação
      setStep(3);
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      alert('Erro ao finalizar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Voltar para loja
  const handleBackToStore = () => {
    navigate(storeId ? `/loja/${storeId}` : '/');
  };

  // Se não há itens, não renderizar
  if (totalItems === 0 && step !== 3) {
    return null;
  }

  return (
    <Layout variant="public" showBanner={false} showFooter={false}>
      <div className="max-w-4xl mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleBackToStore}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Finalizar Pedido</h1>
        </div>

        {/* Indicador de etapas */}
        <div className="flex items-center justify-center gap-4 py-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {step > 1 ? <CheckCircle2 className="h-4 w-4" /> : '1'}
            </div>
            <span className="hidden sm:inline">Endereço</span>
          </div>
          <div className={`flex-1 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {step > 2 ? <CheckCircle2 className="h-4 w-4" /> : '2'}
            </div>
            <span className="hidden sm:inline">Pagamento</span>
          </div>
          <div className={`flex-1 h-0.5 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              3
            </div>
            <span className="hidden sm:inline">Confirmação</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Etapa 1: Endereço de Entrega */}
            {step === 1 && (
              <Card>
                <CardHeader title="Endereço de Entrega" />
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <InputWithLabel
                          label="Rua"
                          placeholder="Nome da rua"
                          value={address.street}
                          onChange={(e) => setAddress({ ...address, street: e.target.value })}
                          error={errors.street}
                          required
                        />
                      </div>
                      <InputWithLabel
                        label="Número"
                        placeholder="123"
                        value={address.number}
                        onChange={(e) => setAddress({ ...address, number: e.target.value })}
                        error={errors.number}
                        required
                      />
                    </div>

                    <InputWithLabel
                      label="Bairro"
                      placeholder="Nome do bairro"
                      value={address.neighborhood}
                      onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                      error={errors.neighborhood}
                      required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputWithLabel
                        label="Cidade"
                        placeholder="São Paulo"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        error={errors.city}
                        required
                      />
                      <InputWithLabel
                        label="CEP"
                        placeholder="00000-000"
                        value={address.zipCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          const formatted = value.replace(/(\d{5})(\d{3})/, '$1-$2');
                          setAddress({ ...address, zipCode: formatted });
                        }}
                        error={errors.zipCode}
                        maxLength={9}
                        required
                      />
                    </div>

                    <InputWithLabel
                      label="Complemento (opcional)"
                      placeholder="Apto, bloco, etc."
                      value={address.complement}
                      onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                    />

                    <InputWithLabel
                      label="Ponto de referência (opcional)"
                      placeholder="Próximo ao..."
                      value={address.reference}
                      onChange={(e) => setAddress({ ...address, reference: e.target.value })}
                    />

                    <Button
                      onClick={handleNextToPayment}
                      className="w-full"
                      size="lg"
                    >
                      Continuar para Pagamento
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Etapa 2: Método de Pagamento */}
            {step === 2 && (
              <Card>
                <CardHeader title="Método de Pagamento" />
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {(['pix', 'credit_card', 'debit_card', 'cash'] as PaymentMethod[]).map((method) => (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`p-4 border-2 rounded-lg transition-all ${
                            paymentMethod === method
                              ? 'border-primary bg-primary/5'
                              : 'border-muted hover:border-primary/50'
                          }`}
                        >
                          <CreditCard className="h-6 w-6 mx-auto mb-2" />
                          <div className="text-sm font-medium capitalize">
                            {method === 'credit_card' ? 'Cartão de Crédito' :
                             method === 'debit_card' ? 'Cartão de Débito' :
                             method === 'pix' ? 'PIX' : 'Dinheiro'}
                          </div>
                        </button>
                      ))}
                    </div>

                    <Textarea
                      label="Observações do pedido (opcional)"
                      placeholder="Sem cebola, ponto da carne, etc."
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      rows={3}
                    />

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1"
                      >
                        Voltar
                      </Button>
                      <Button
                        onClick={handleFinalizeOrder}
                        className="flex-1"
                        size="lg"
                        loading={loading}
                      >
                        Finalizar Pedido
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Etapa 3: Confirmação */}
            {step === 3 && (
              <Card>
                <CardContent>
                  <div className="text-center space-y-6 py-8">
                    <CheckCircle2 className="h-16 w-16 mx-auto text-green-600" />
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Pedido Confirmado!</h2>
                      <p className="text-muted-foreground">
                        Seu pedido foi recebido e está sendo preparado.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Tempo estimado de entrega:
                      </p>
                      <p className="text-lg font-semibold">
                        {currentStore?.settings.deliveryTime || '30-45 min'}
                      </p>
                    </div>
                    <Button
                      onClick={handleBackToStore}
                      className="w-full sm:w-auto"
                      size="lg"
                    >
                      Fazer Novo Pedido
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader title="Resumo do Pedido" />
              <CardContent>
                <div className="space-y-4">
                  {/* Itens */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {item.quantity}x {formatPrice(item.product.price)}
                          </p>
                        </div>
                        <p className="font-semibold">
                          {formatPrice(item.totalPrice)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatPrice(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taxa de entrega</span>
                      <span>
                        {finalDeliveryFee === 0 ? (
                          <Badge variant="secondary">Grátis</Badge>
                        ) : (
                          formatPrice(finalDeliveryFee)
                        )}
                      </span>
                    </div>
                    {finalDeliveryFee === 0 && totalAmount < freeDeliveryAbove && (
                      <p className="text-xs text-muted-foreground">
                        Frete grátis acima de {formatPrice(freeDeliveryAbove)}
                      </p>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>{formatPrice(finalTotal)}</span>
                    </div>
                  </div>

                  {/* Endereço resumido (se na etapa 2 ou 3) */}
                  {(step === 2 || step === 3) && (
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{address.street}, {address.number}</p>
                          <p className="text-muted-foreground">
                            {address.neighborhood}, {address.city}
                          </p>
                          <p className="text-muted-foreground">{address.zipCode}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

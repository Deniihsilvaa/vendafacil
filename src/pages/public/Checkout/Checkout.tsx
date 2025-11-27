import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { useCartContext, useStoreContext, useAuthContext } from '@/contexts';
import { Button, Card, CardHeader, CardContent, Badge, Collapsible, Input } from '@/components/ui';
import { InputWithLabel } from '@/components/ui/forms/InputWithLabel';
import { Textarea } from '@/components/ui/forms';
import { ArrowLeft, MapPin, CreditCard, CheckCircle2, Truck, Store, Home, Briefcase, Info, Lock } from 'lucide-react';
import { formatPrice } from '@/utils';
import { showErrorToast } from '@/utils/toast';
import { OrderService } from '@/services/orderService';
import { AuthService } from '@/services/authService';
import type { DeliveryAddress } from '@/types';

type PaymentMethod = 'credit_card' | 'debit_card' | 'pix' | 'cash';
type FulfillmentMethod = 'delivery' | 'pickup';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();
  const { items, totalItems, totalAmount, clearCart } = useCartContext();
  const { currentStore } = useStoreContext();
  const { user, isCustomer, loading: authLoading, login } = useAuthContext();
  
  // Estados para login/cadastro
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  
  // Estados para cadastro
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  
  // Estado para verificar token (evitar hidratação mismatch)
  const [hasToken, setHasToken] = useState(false);
  
  // Verificar token apenas no cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasToken(!!localStorage.getItem('store-flow-token'));
    }
  }, [user]);
  
  // Verificar se não está autenticado
  const isNotAuthenticated = !authLoading && (!user || !isCustomer || !hasToken);

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Endereço, 2: Pagamento, 3: Confirmação
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dados do formulário
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>('delivery');
  const [address, setAddress] = useState<DeliveryAddress>({
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    complement: '',
    reference: '',
  });
  
  // Estado para rastrear se o endereço veio do perfil (readonly)
  const [isAddressFromProfile, setIsAddressFromProfile] = useState(false);
  // Estado para selecionar qual endereço usar (home/work)
  const [selectedAddressType, setSelectedAddressType] = useState<'home' | 'work' | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [observations, setObservations] = useState('');

  // Validar se há itens no carrinho
  useEffect(() => {
    if (totalItems === 0) {
      navigate(storeId ? `/loja/${storeId}` : '/');
    }
  }, [totalItems, navigate, storeId]);

  // Preencher endereço padrão do usuário automaticamente
  useEffect(() => {
    if (user && isCustomer && fulfillmentMethod === 'delivery') {
      const customer = user as import('@/types/auth').Customer;
      
      // Verificar se já tem endereço preenchido manualmente (não do perfil)
      const hasManualAddress = !isAddressFromProfile && (address.street.trim() || address.number.trim() || address.city.trim());
      
      if (!hasManualAddress && customer.addresses) {
        // Buscar endereço padrão (isDefault: true)
        // Prioridade: home com isDefault > work com isDefault > home > work
        let defaultAddress: (typeof customer.addresses.home) | undefined;
        let addressType: 'home' | 'work' | null = null;
        
        if (customer.addresses.home?.isDefault) {
          defaultAddress = customer.addresses.home;
          addressType = 'home';
        } else if (customer.addresses.work?.isDefault) {
          defaultAddress = customer.addresses.work;
          addressType = 'work';
        } else if (customer.addresses.home) {
          defaultAddress = customer.addresses.home;
          addressType = 'home';
        } else if (customer.addresses.work) {
          defaultAddress = customer.addresses.work;
          addressType = 'work';
        }
        
        if (defaultAddress) {
          setAddress({
            street: defaultAddress.street || '',
            number: defaultAddress.number || '',
            neighborhood: defaultAddress.neighborhood || '',
            city: defaultAddress.city || '',
            state: defaultAddress.state || '',
            zipCode: defaultAddress.zipCode || '',
            complement: defaultAddress.complement || '',
            reference: defaultAddress.reference || '',
          });
          setIsAddressFromProfile(true);
          setSelectedAddressType(addressType);
        }
      }
    } else if (fulfillmentMethod === 'pickup') {
      // Limpar estado quando mudar para pickup
      setIsAddressFromProfile(false);
      setSelectedAddressType(null);
    }
  }, [user, isCustomer, fulfillmentMethod]); // Não incluir address e isAddressFromProfile nas dependências

  // Função para trocar o endereço selecionado
  const handleChangeAddressType = (type: 'home' | 'work') => {
    if (!user || !isCustomer) return;
    
    const customer = user as import('@/types/auth').Customer;
    const selectedAddress = type === 'home' ? customer.addresses?.home : customer.addresses?.work;
    
    if (selectedAddress) {
      setAddress({
        street: selectedAddress.street || '',
        number: selectedAddress.number || '',
        neighborhood: selectedAddress.neighborhood || '',
        city: selectedAddress.city || '',
        state: selectedAddress.state || '',
        zipCode: selectedAddress.zipCode || '',
        complement: selectedAddress.complement || '',
        reference: selectedAddress.reference || '',
      });
      setIsAddressFromProfile(true);
      setSelectedAddressType(type);
    }
  };

  // Função para permitir edição manual (remover readonly)
  const handleEnableManualEdit = () => {
    setIsAddressFromProfile(false);
    setSelectedAddressType(null);
  };

  // Calcular taxa de entrega
  // Se for retirada (pickup), não cobra frete
  // Se for entrega (delivery), usa as configurações da loja
  const deliveryFee = fulfillmentMethod === 'pickup' 
    ? 0 
    : (currentStore?.settings.deliveryFee || 0);
  const freeDeliveryAbove = currentStore?.settings.freeDeliveryAbove || 0;
  const finalDeliveryFee = fulfillmentMethod === 'pickup' 
    ? 0 
    : (totalAmount >= freeDeliveryAbove ? 0 : deliveryFee);
  const finalTotal = totalAmount + finalDeliveryFee;

  // Debug: Verificar valores do frete (apenas em desenvolvimento)
  if (import.meta.env.DEV) {
    console.log('📦 Cálculo de Frete:', {
      fulfillmentMethod,
      deliveryFeeFromStore: currentStore?.settings.deliveryFee,
      freeDeliveryAbove,
      totalAmount,
      finalDeliveryFee,
      finalTotal,
    });
  }

  // Validação do endereço
  const validateAddress = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Se for delivery, endereço é obrigatório
    if (fulfillmentMethod === 'delivery') {
      if (!address.street.trim()) newErrors.street = 'Rua é obrigatória';
      if (!address.number.trim()) newErrors.number = 'Número é obrigatório';
      if (!address.neighborhood.trim()) newErrors.neighborhood = 'Bairro é obrigatório';
      if (!address.city.trim()) newErrors.city = 'Cidade é obrigatória';
      if (!address.state.trim()) newErrors.state = 'Estado é obrigatório';
      if (!address.zipCode.trim()) newErrors.zipCode = 'CEP é obrigatório';
      
      // Validar formato do CEP
      const zipCodeRegex = /^\d{5}-?\d{3}$/;
      if (address.zipCode && !zipCodeRegex.test(address.zipCode.replace(/\D/g, ''))) {
        newErrors.zipCode = 'CEP inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validar se o método de pagamento é aceito pela loja
  const isPaymentMethodAccepted = (method: PaymentMethod): boolean => {
    if (!currentStore) return false;
    const accepts = currentStore.settings.acceptsPayment;
    return (
      (method === 'credit_card' && accepts.creditCard) ||
      (method === 'debit_card' && accepts.debitCard) ||
      (method === 'pix' && accepts.pix) ||
      (method === 'cash' && accepts.cash)
    );
  };

  // Validar se o fulfillment method é habilitado pela loja
  // TODO: Implementar validação baseada nas configurações da loja quando disponível
  const isFulfillmentMethodEnabled = (): boolean => {
    if (!currentStore) return false;
    // Por enquanto, vamos assumir que ambos estão habilitados se a loja existe
    return true;
  };

  // Formatar resumo do endereço para exibição
  const getAddressSummary = (): string => {
    if (!address.street || !address.number) return '';
    const parts = [
      `${address.street}, ${address.number}`,
      address.neighborhood,
      address.city,
      address.state,
    ].filter(Boolean);
    return parts.join(' - ');
  };

  // Fazer login no checkout
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!storeId) {
      showErrorToast(new Error('Loja não encontrada'), 'Erro');
      return;
    }
    
    if (!loginEmail || !loginPassword) {
      showErrorToast(new Error('Preencha email e senha'), 'Erro');
      return;
    }
    
    setLoginLoading(true);
    try {
      await login({
        email: loginEmail,
        password: loginPassword,
        storeId,
      });
      // Login bem-sucedido - o componente será re-renderizado automaticamente
      setLoginEmail('');
      setLoginPassword('');
    } catch (error) {
      // Erro já é tratado pelo AuthContext
      console.error('Erro no login:', error);
    } finally {
      setLoginLoading(false);
    }
  };

  // Fazer cadastro no checkout
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!storeId) {
      showErrorToast(new Error('Loja não encontrada'), 'Erro');
      return;
    }
    
    if (!loginEmail || !loginPassword || !signupName || !signupPhone) {
      showErrorToast(new Error('Preencha todos os campos'), 'Erro');
      return;
    }
    
    if (loginPassword.length < 6) {
      showErrorToast(new Error('A senha deve ter no mínimo 6 caracteres'), 'Erro');
      return;
    }
    
    if (signupPhone.length < 10 || signupPhone.length > 15) {
      showErrorToast(new Error('Telefone inválido'), 'Erro');
      return;
    }
    
    setLoginLoading(true);
    try {
      // Criar conta
      await AuthService.customerSignup(loginEmail, loginPassword, storeId, signupName, signupPhone);
      
      // Fazer login automaticamente após cadastro
      await login({
        email: loginEmail,
        password: loginPassword,
        storeId,
      });
      
      // Limpar campos
      setLoginEmail('');
      setLoginPassword('');
      setSignupName('');
      setSignupPhone('');
    } catch (error) {
      console.error('Erro no cadastro:', error);
    } finally {
      setLoginLoading(false);
    }
  };

  // Avançar para etapa de pagamento
  const handleNextToPayment = () => {
    if (validateAddress()) {
      setStep(2);
    }
  };

  // Finalizar pedido
  const handleFinalizeOrder = async () => {
    // Validar autenticação
    if (!user || !isCustomer) {
      showErrorToast(new Error('Você precisa estar logado para finalizar o pedido'), 'Erro');
      navigate(storeId ? `/loja/${storeId}` : '/');
      return;
    }

    // Validar loja
    if (!currentStore || !storeId) {
      showErrorToast(new Error('Loja não encontrada'), 'Erro');
      return;
    }

    // Validar método de pagamento
    if (!isPaymentMethodAccepted(paymentMethod)) {
      showErrorToast(new Error(`A loja não aceita pagamento via ${paymentMethod === 'credit_card' ? 'Cartão de Crédito' : paymentMethod === 'debit_card' ? 'Cartão de Débito' : paymentMethod === 'pix' ? 'PIX' : 'Dinheiro'}`), 'Erro');
      return;
    }

    // Validar fulfillment method
    if (!isFulfillmentMethodEnabled()) {
      showErrorToast(new Error(`${fulfillmentMethod === 'delivery' ? 'Entrega' : 'Retirada'} não está disponível para esta loja`), 'Erro');
      return;
    }

    // Validar valor mínimo
    if (totalAmount < currentStore.settings.minOrderValue) {
      showErrorToast(new Error(`Valor mínimo do pedido é ${formatPrice(currentStore.settings.minOrderValue)}`), 'Erro');
      return;
    }

    setLoading(true);
    
    try {
      // Mapear itens do carrinho para o formato da API
      const orderItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.price,
        observations: item.observations || undefined,
        // Mapear customizações: se está no array, foi selecionada
        // Para boolean: valor 'true', para quantity: valor '1' (assumindo quantidade 1)
        customizations: item.customizations.length > 0 ? item.customizations.map(custom => ({
          customization_id: custom.id,
          value: custom.selectionType === 'boolean' ? 'true' : '1',
        })) : undefined,
      }));

      // Criar pedido via API
      const order = await OrderService.createOrder({
        storeId,
        items: orderItems,
        deliveryAddress: {
          street: address.street,
          number: address.number,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          zip_code: address.zipCode.replace(/\D/g, ''), // Remover formatação do CEP
          complement: address.complement || undefined,
        },
        paymentMethod,
        fulfillmentMethod,
        observations: observations.trim() || undefined,
      });

      console.log('Pedido criado com sucesso:', order);

      // Limpar carrinho
      clearCart();
      
      // Redirecionar para página de confirmação do pedido
      navigate(`/loja/${storeId}/pedido/${order.id}`);
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      // O erro já foi tratado pelo OrderService com toast
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

  // Se não estiver autenticado, mostrar overlay de login
  if (isNotAuthenticated) {
    return (
      <Layout variant="public" showBanner={false} showFooter={false}>
        <div className="max-w-4xl mx-auto py-6 space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(storeId ? `/loja/${storeId}` : '/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold">Finalizar Pedido</h1>
          </div>
          
          {/* Overlay de autenticação */}
          <Card className="relative">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <div className="bg-background border rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">
                      {authMode === 'login' ? 'Login necessário' : 'Criar conta'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {authMode === 'login' 
                        ? 'Faça login para continuar com o pedido' 
                        : 'Crie sua conta para continuar'}
                    </p>
                  </div>
                </div>
                
                {/* Tabs Login/Cadastro */}
                <div className="flex gap-2 mb-4">
                  <Button
                    type="button"
                    variant={authMode === 'login' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setAuthMode('login')}
                    disabled={loginLoading}
                  >
                    Entrar
                  </Button>
                  <Button
                    type="button"
                    variant={authMode === 'signup' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setAuthMode('signup')}
                    disabled={loginLoading}
                  >
                    Criar conta
                  </Button>
                </div>
                
                {authMode === 'login' ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label htmlFor="checkout-email" className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <Input
                        id="checkout-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        disabled={loginLoading}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="checkout-password" className="block text-sm font-medium mb-1">
                        Senha
                      </label>
                      <Input
                        id="checkout-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        disabled={loginLoading}
                        className="w-full"
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={loginLoading}
                    >
                      {loginLoading ? 'Entrando...' : 'Entrar e continuar'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-3">
                    <div>
                      <label htmlFor="signup-name" className="block text-sm font-medium mb-1">
                        Nome completo
                      </label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Seu nome"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        required
                        minLength={2}
                        disabled={loginLoading}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="signup-phone" className="block text-sm font-medium mb-1">
                        Telefone
                      </label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="11999999999"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, ''))}
                        required
                        minLength={10}
                        maxLength={15}
                        disabled={loginLoading}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="signup-email" className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        disabled={loginLoading}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="signup-password" className="block text-sm font-medium mb-1">
                        Senha (mínimo 6 caracteres)
                      </label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        minLength={6}
                        disabled={loginLoading}
                        className="w-full"
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={loginLoading}
                    >
                      {loginLoading ? 'Criando conta...' : 'Criar conta e continuar'}
                    </Button>
                  </form>
                )}
              </div>
            </div>
            
            {/* Conteúdo bloqueado (opcional - mostrar preview) */}
            <CardContent className="p-6 opacity-50 pointer-events-none">
              <div className="space-y-4">
                <p className="text-muted-foreground">Faça login para ver o checkout</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
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
            {/* Etapa 1: Endereço de Entrega / Retirada */}
            {step === 1 && (
              <Card>
                <CardHeader title={fulfillmentMethod === 'delivery' ? 'Endereço de Entrega' : 'Retirada na Loja'} />
                <CardContent>
                  <div className="space-y-4">
                    {/* Seleção de método de atendimento */}
                    {currentStore?.settings && (
                      <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                        {currentStore.settings.isActive && (
                          <>
                            <button
                              onClick={() => setFulfillmentMethod('delivery')}
                              className={`p-4 border-2 rounded-lg transition-all ${
                                fulfillmentMethod === 'delivery'
                                  ? 'border-primary bg-primary/5'
                                  : 'border-muted hover:border-primary/50'
                              }`}
                            >
                              <Truck className="h-6 w-6 mx-auto mb-2" />
                              <div className="text-sm font-medium">Entrega</div>
                            </button>
                            <button
                              onClick={() => setFulfillmentMethod('pickup')}
                              className={`p-4 border-2 rounded-lg transition-all ${
                                fulfillmentMethod === 'pickup'
                                  ? 'border-primary bg-primary/5'
                                  : 'border-muted hover:border-primary/50'
                              }`}
                            >
                              <Store className="h-6 w-6 mx-auto mb-2" />
                              <div className="text-sm font-medium">Retirada</div>
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {fulfillmentMethod === 'delivery' && (
                      <>
                        {/* Seletor de endereço (se usuário tiver endereços salvos) */}
                        {user && isCustomer && (user as import('@/types/auth').Customer).addresses && 
                         ((user as import('@/types/auth').Customer).addresses?.home || (user as import('@/types/auth').Customer).addresses?.work) && (
                          <div className="space-y-3 pb-4 border-b">
                            <label className="text-sm font-medium text-foreground">
                              Escolha o endereço de entrega
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {(user as import('@/types/auth').Customer).addresses?.home && (
                                <button
                                  type="button"
                                  onClick={() => handleChangeAddressType('home')}
                                  className={`p-3 border-2 rounded-lg transition-all text-left ${
                                    selectedAddressType === 'home'
                                      ? 'border-primary bg-primary/5'
                                      : 'border-muted hover:border-primary/50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <Home className="h-4 w-4 text-primary" />
                                    <span className="font-medium text-sm">Casa</span>
                                    {(user as import('@/types/auth').Customer).addresses?.home?.isDefault && (
                                      <Badge variant="default" className="text-xs">Padrão</Badge>
                                    )}
                                  </div>
                                  {(user as import('@/types/auth').Customer).addresses?.home && (
                                    <p className="text-xs text-muted-foreground truncate">
                                      {(user as import('@/types/auth').Customer).addresses?.home?.street}, {(user as import('@/types/auth').Customer).addresses?.home?.number}
                                    </p>
                                  )}
                                </button>
                              )}
                              {(user as import('@/types/auth').Customer).addresses?.work && (
                                <button
                                  type="button"
                                  onClick={() => handleChangeAddressType('work')}
                                  className={`p-3 border-2 rounded-lg transition-all text-left ${
                                    selectedAddressType === 'work'
                                      ? 'border-primary bg-primary/5'
                                      : 'border-muted hover:border-primary/50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <Briefcase className="h-4 w-4 text-primary" />
                                    <span className="font-medium text-sm">Trabalho</span>
                                    {(user as import('@/types/auth').Customer).addresses?.work?.isDefault && (
                                      <Badge variant="default" className="text-xs">Padrão</Badge>
                                    )}
                                  </div>
                                  {(user as import('@/types/auth').Customer).addresses?.work && (
                                    <p className="text-xs text-muted-foreground truncate">
                                      {(user as import('@/types/auth').Customer).addresses?.work?.street}, {(user as import('@/types/auth').Customer).addresses?.work?.number}
                                    </p>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Campos de endereço - Ocultos por padrão se vierem do perfil */}
                        {isAddressFromProfile ? (
                          <Collapsible
                            title={`Endereço de entrega${getAddressSummary() ? `: ${getAddressSummary()}` : ''}`}
                            defaultOpen={false}
                            className="border-muted"
                          >
                            <div className="space-y-4 pt-2">
                              {/* Notificação discreta para editar endereço no perfil */}
                              <div className="bg-muted/50 border border-muted rounded-lg p-3 flex items-start gap-2">
                                <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-muted-foreground">
                                    Este endereço foi preenchido automaticamente do seu perfil. 
                                    Para alterar,{' '}
                                    <button
                                      type="button"
                                      onClick={handleEnableManualEdit}
                                      className="text-primary hover:underline font-medium"
                                    >
                                      clique aqui para editar manualmente
                                    </button>
                                    {' '}ou{' '}
                                    <button
                                      type="button"
                                      onClick={() => navigate(storeId ? `/loja/${storeId}/perfil` : '/perfil')}
                                      className="text-primary hover:underline font-medium"
                                    >
                                      edite no seu perfil
                                    </button>
                                    .
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-2">
                                  <InputWithLabel
                                    label="Rua"
                                    placeholder="Nome da rua"
                                    value={address.street}
                                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                    error={errors.street}
                                    required
                                    readOnly={isAddressFromProfile}
                                    className={isAddressFromProfile ? 'bg-muted cursor-not-allowed' : ''}
                                  />
                                </div>
                                <InputWithLabel
                                  label="Número"
                                  placeholder="123"
                                  value={address.number}
                                  onChange={(e) => setAddress({ ...address, number: e.target.value })}
                                  error={errors.number}
                                  required
                                  readOnly={isAddressFromProfile}
                                  className={isAddressFromProfile ? 'bg-muted cursor-not-allowed' : ''}
                                />
                              </div>

                              <InputWithLabel
                                label="Bairro"
                                placeholder="Nome do bairro"
                                value={address.neighborhood}
                                onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                                error={errors.neighborhood}
                                required
                                readOnly={isAddressFromProfile}
                                className={isAddressFromProfile ? 'bg-muted cursor-not-allowed' : ''}
                              />

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <InputWithLabel
                                  label="Cidade"
                                  placeholder="São Paulo"
                                  value={address.city}
                                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                  error={errors.city}
                                  required
                                  readOnly={isAddressFromProfile}
                                  className={isAddressFromProfile ? 'bg-muted cursor-not-allowed' : ''}
                                />
                                <InputWithLabel
                                  label="Estado"
                                  placeholder="SP"
                                  value={address.state}
                                  onChange={(e) => setAddress({ ...address, state: e.target.value.toUpperCase() })}
                                  error={errors.state}
                                  maxLength={2}
                                  required
                                  readOnly={isAddressFromProfile}
                                  className={isAddressFromProfile ? 'bg-muted cursor-not-allowed' : ''}
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
                                  readOnly={isAddressFromProfile}
                                  className={isAddressFromProfile ? 'bg-muted cursor-not-allowed' : ''}
                                />
                              </div>

                              <InputWithLabel
                                label="Complemento (opcional)"
                                placeholder="Apto, bloco, etc."
                                value={address.complement}
                                onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                                readOnly={isAddressFromProfile}
                                className={isAddressFromProfile ? 'bg-muted cursor-not-allowed' : ''}
                              />

                              <InputWithLabel
                                label="Ponto de referência (opcional)"
                                placeholder="Próximo ao..."
                                value={address.reference}
                                onChange={(e) => setAddress({ ...address, reference: e.target.value })}
                                readOnly={isAddressFromProfile}
                                className={isAddressFromProfile ? 'bg-muted cursor-not-allowed' : ''}
                              />
                            </div>
                          </Collapsible>
                        ) : (
                          <div className="space-y-4">
                            {/* Campos de endereço quando não vem do perfil (editável) */}
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

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <InputWithLabel
                                label="Cidade"
                                placeholder="São Paulo"
                                value={address.city}
                                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                error={errors.city}
                                required
                              />
                              <InputWithLabel
                                label="Estado"
                                placeholder="SP"
                                value={address.state}
                                onChange={(e) => setAddress({ ...address, state: e.target.value.toUpperCase() })}
                                error={errors.state}
                                maxLength={2}
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
                          </div>
                        )}
                      </>
                    )}

                    {fulfillmentMethod === 'pickup' && (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Você retirará seu pedido na loja. O endereço da loja será usado para a retirada.
                        </p>
                        {currentStore?.info.address && (
                          <div className="mt-2 text-sm">
                            <p className="font-medium">{currentStore.info.address.street}, {currentStore.info.address.number}</p>
                            <p className="text-muted-foreground">
                              {currentStore.info.address.neighborhood}, {currentStore.info.address.city} - {currentStore.info.address.state}
                            </p>
                            <p className="text-muted-foreground">{currentStore.info.address.zipCode}</p>
                          </div>
                        )}
                      </div>
                    )}

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
                    {fulfillmentMethod === 'delivery' && (
                      <>
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
                        {finalDeliveryFee === 0 && totalAmount < freeDeliveryAbove && freeDeliveryAbove > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Frete grátis acima de {formatPrice(freeDeliveryAbove)}
                          </p>
                        )}
                      </>
                    )}
                    {fulfillmentMethod === 'pickup' && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Retirada na loja</span>
                        <Badge variant="secondary">Sem taxa</Badge>
                      </div>
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

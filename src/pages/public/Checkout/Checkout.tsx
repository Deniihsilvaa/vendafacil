import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { useCartContext, useStoreContext, useAuthContext } from '@/contexts';
import { Button, Card, CardHeader, CardContent } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import { useCheckoutAddress } from './hooks/useCheckoutAddress';
import { useCheckoutOrder } from './hooks/useCheckoutOrder';
import {
  CheckoutStepsIndicator,
  FulfillmentMethodSelector,
  AddressSelector,
  CheckoutAddressForm,
  CheckoutPaymentForm,
  CheckoutOrderSummary,
  CheckoutConfirmation,
  PickupInfo,
} from './components';
import type { PaymentMethod, FulfillmentMethod, CheckoutStep } from './types';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { storeId } = useParams<{ storeId: string }>();
  const { items, totalItems, totalAmount } = useCartContext();
  const { currentStore } = useStoreContext();
  const { customer, loading: authLoading } = useAuthContext();

  const [step, setStep] = useState<CheckoutStep>(1);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [observations, setObservations] = useState('');

  // Hooks de lógica de negócio
  const address = useCheckoutAddress(
    customer,
    !!customer,
    fulfillmentMethod
  );
  const order = useCheckoutOrder(
    address.address,
    paymentMethod,
    fulfillmentMethod,
    observations
  );

  // Verificar se está autenticado
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasToken(!!localStorage.getItem('store-flow-token'));
    }
  }, [customer]);

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!authLoading && (!customer || !hasToken)) {
      // Preservar a rota atual para redirecionar após login
      navigate(`/loja/${storeId}/login`, {
        state: { from: location.pathname },
        replace: true,
      });
    }
  }, [authLoading, customer, hasToken, navigate, storeId, location.pathname]);

  // Validar se há itens no carrinho
  useEffect(() => {
    if (totalItems === 0 && step !== 3) {
      navigate(storeId ? `/loja/${storeId}` : '/');
    }
  }, [totalItems, navigate, storeId, step]);

  const handleNextToPayment = () => {
    if (order.validateAddressStep()) {
      setStep(2);
    }
  };

  const handleBackToStore = () => {
    navigate(storeId ? `/loja/${storeId}` : '/');
  };

  // Se não há itens, não renderizar
  if (totalItems === 0 && step !== 3) {
    return null;
  }

  // Se não estiver autenticado, não renderizar (será redirecionado)
  if (!customer || !hasToken || authLoading) {
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

        <CheckoutStepsIndicator step={step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Etapa 1: Endereço de Entrega / Retirada */}
            {step === 1 && (
              <Card>
                <CardHeader title={fulfillmentMethod === 'delivery' ? 'Endereço de Entrega' : 'Retirada na Loja'} />
                <CardContent>
                  <div className="space-y-4">
                    {currentStore?.settings && (
                      <FulfillmentMethodSelector
                        fulfillmentMethod={fulfillmentMethod}
                        onSelect={setFulfillmentMethod}
                        isStoreActive={currentStore.settings.isActive}
                      />
                    )}

                    {fulfillmentMethod === 'delivery' && (
                      <>
                        {customer && customer.addresses && 
                         (customer.addresses?.home || customer.addresses?.work) && (
                          <AddressSelector
                            customer={customer}
                            selectedAddressType={address.selectedAddressType}
                            onSelect={address.handleChangeAddressType}
                          />
                        )}

                        <CheckoutAddressForm
                          address={address.address}
                          setAddress={address.setAddress}
                          errors={order.errors}
                          isAddressFromProfile={address.isAddressFromProfile}
                          addressSummary={address.getAddressSummary()}
                          onEnableManualEdit={address.handleEnableManualEdit}
                          fulfillmentMethod={fulfillmentMethod}
                        />
                      </>
                    )}

                    {fulfillmentMethod === 'pickup' && (
                      <PickupInfo store={currentStore} />
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
                  <CheckoutPaymentForm
                    paymentMethod={paymentMethod}
                    onPaymentMethodChange={setPaymentMethod}
                    observations={observations}
                    onObservationsChange={setObservations}
                    onBack={() => setStep(1)}
                    onFinalize={order.validateAndFinalize}
                    loading={order.loading}
                  />
                </CardContent>
              </Card>
            )}

            {/* Etapa 3: Confirmação */}
            {step === 3 && (
              <CheckoutConfirmation
                store={currentStore}
                onBackToStore={handleBackToStore}
              />
            )}
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <CheckoutOrderSummary
              items={items}
              totalAmount={totalAmount}
              fulfillmentMethod={fulfillmentMethod}
              address={address.address}
              step={step}
              store={currentStore}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

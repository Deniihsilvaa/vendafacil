// EXEMPLO DE IMPLEMENTAÇÃO OTIMIZADA PARA App.tsx
// Este arquivo mostra como implementar Code Splitting e Lazy Loading

import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { 
  StoreProvider, 
  ThemeProvider, 
  AuthProvider, 
  CartProvider 
} from '@/contexts';
import { Toaster } from '@/components/ui/toast';

// ============================================
// COMPONENTE DE LOADING
// ============================================
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
      <p className="mt-4 text-gray-600">Carregando...</p>
    </div>
  </div>
);

// ============================================
// PÁGINAS PÚBLICAS (MANTER NORMAL - sempre usadas)
// ============================================
import { StoreFront } from '@/pages/public/StoreFront';
import { StorePage } from '@/pages/public/StorePage';

// ============================================
// LAZY LOADING - PÁGINAS DO MERCHANT
// ============================================
const MerchantLoginWithContext = lazy(() => 
  import('@/pages/merchant/login/MerchantLoginWithContext')
);

const MerchantLayout = lazy(() => 
  import('@/pages/merchant/MerchantLayout')
);

const MerchantDashboard = lazy(() => 
  import('@/pages/merchant/dashboard/MerchantDashboard')
);

const MerchantProducts = lazy(() => 
  import('@/pages/merchant/products/ProductManagement')
);

const ProductCreate = lazy(() => 
  import('@/pages/merchant/products/ProductCreate')
);

const MerchantOrdersPage = lazy(() => 
  import('@/pages/merchant/orders/MerchantOrders')
);

const MerchantSettings = lazy(() => 
  import('@/pages/merchant/settings/MerchantSettings')
);

// ============================================
// LAZY LOADING - PÁGINAS DO CUSTOMER
// ============================================
const Profile = lazy(() => 
  import('@/pages/customer/profile/Profile')
);

const OrderConfirmation = lazy(() => 
  import('@/pages/customer/orders/OrderConfirmation')
);

const OrdersList = lazy(() => 
  import('@/pages/customer/orders/ListOrders')
);

// ============================================
// LAZY LOADING - CHECKOUT (usado ocasionalmente)
// ============================================
const Checkout = lazy(() => 
  import('@/pages/public/Checkout/Checkout')
);

// ============================================
// APP PRINCIPAL
// ============================================
function App() {
  return (
    <StoreProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* ========== ROTAS PÚBLICAS (Customer) ========== */}
            <Route element={
              <AuthProvider>
                <CartProvider>
                  <>
                    <Toaster />
                  </>
                </CartProvider>
              </AuthProvider>
            }>
              {/* Páginas principais - SEM lazy loading */}
              <Route path="/" element={<StoreFront />} />
              <Route path="/loja/:storeId" element={<StorePage />} />
              
              {/* Páginas secundárias - COM lazy loading */}
              <Route path="/stores/:storeId" element={
                <Suspense fallback={<PageLoader />}>
                  <OrderConfirmation />
                </Suspense>
              } />
              
              <Route path="/loja/:storeId/orders" element={
                <Suspense fallback={<PageLoader />}>
                  <OrdersList />
                </Suspense>
              } />
              
              {/* Checkout - lazy load (nem todos chegam aqui) */}
              <Route path="/loja/:storeId/checkout" element={
                <Suspense fallback={<PageLoader />}>
                  <Checkout />
                </Suspense>
              } />
              
              <Route path="/stores/:storeId/checkout" element={
                <Suspense fallback={<PageLoader />}>
                  <Checkout />
                </Suspense>
              } />
              
              {/* Perfil do cliente */}
              <Route path="/loja/:storeId/perfil" element={
                <Suspense fallback={<PageLoader />}>
                  <Profile />
                </Suspense>
              } />
              
              <Route path="/stores/:storeId/perfil" element={
                <Suspense fallback={<PageLoader />}>
                  <Profile />
                </Suspense>
              } />
              
              {/* Confirmação de pedido */}
              <Route path="/loja/:storeId/pedido/:orderId" element={
                <Suspense fallback={<PageLoader />}>
                  <OrderConfirmation />
                </Suspense>
              } />
              
              <Route path="/stores/:storeId/pedido/:orderId" element={
                <Suspense fallback={<PageLoader />}>
                  <OrderConfirmation />
                </Suspense>
              } />
            </Route>
            
            {/* ========== ROTAS DE MERCHANT ========== */}
            {/* Login do Merchant - lazy load */}
            <Route path="/merchant/login" element={
              <Suspense fallback={<PageLoader />}>
                <MerchantLoginWithContext />
              </Suspense>
            } />
            
            {/* Rotas protegidas do Merchant - lazy load */}
            <Route path="/merchant" element={
              <Suspense fallback={<PageLoader />}>
                <MerchantLayout />
              </Suspense>
            }>
              <Route path="dashboard" element={
                <Suspense fallback={<PageLoader />}>
                  <MerchantDashboard />
                </Suspense>
              } />
              
              <Route path="orders" element={
                <Suspense fallback={<PageLoader />}>
                  <MerchantOrdersPage />
                </Suspense>
              } />
              
              <Route path="products" element={
                <Suspense fallback={<PageLoader />}>
                  <MerchantProducts />
                </Suspense>
              } />
              
              <Route path="products/new" element={
                <Suspense fallback={<PageLoader />}>
                  <ProductCreate />
                </Suspense>
              } />
              
              <Route path="settings" element={
                <Suspense fallback={<PageLoader />}>
                  <MerchantSettings />
                </Suspense>
              } />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </StoreProvider>
  );
}

export default App;

// ============================================
// GANHOS ESPERADOS:
// ============================================
// Bundle inicial: ~400-500 KB (antes: 825 KB)
// Merchant chunk: ~150 KB (carrega só quando acessar)
// Customer chunk: ~100 KB (carrega só quando acessar)
// Checkout chunk: ~80 KB (carrega só no checkout)
//
// Total de redução: ~40-50% no carregamento inicial!
// ============================================


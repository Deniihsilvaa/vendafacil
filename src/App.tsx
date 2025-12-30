import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { 
  StoreProvider, 
  ThemeProvider
} from '@/contexts';
import { PublicLayoutWrapper } from '@/components/layout/PublicLayoutWrapper';

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
// PÁGINAS PRINCIPAIS (SEM LAZY LOADING)
// Mantidas normais pois são acessadas frequentemente
// ============================================
import { StoreFront } from '@/pages/public/StoreFront';
import { StorePage } from '@/pages/public/StorePage';

// ============================================
// LAZY LOADING - PÁGINAS DO MERCHANT
// ============================================
const MerchantLoginWithContext = lazy(() => 
  import('@/pages/merchant/login/MerchantLoginWithContext').then(m => ({ default: m.MerchantLoginWithContext }))
);

const MerchantLayout = lazy(() => 
  import('@/pages/merchant/MerchantLayout').then(m => ({ default: m.MerchantLayout }))
);

const MerchantProfile = lazy(() => 
  import('@/pages/merchant/profile/MerchantProfile').then(m => ({ default: m.MerchantProfile }))
);
const MerchantDashboard = lazy(() => 
  import('@/pages/merchant/dashboard/MerchantDashboard').then(m => ({ default: m.MerchantDashboard }))
);

const MerchantProducts = lazy(() => 
  import('@/pages/merchant/products/ProductManagement').then(m => ({ default: m.ProductManagement }))
);

const ProductCreate = lazy(() => 
  import('@/pages/merchant/products/ProductCreate').then(m => ({ default: m.ProductCreate }))
);

const MerchantOrdersPage = lazy(() => 
  import('@/pages/merchant/orders/MerchantOrdersPage').then(m => ({ default: m.MerchantOrdersPage }))
);

const MerchantSettings = lazy(() => 
  import('@/pages/merchant/settings/MerchantSettings').then(m => ({ default: m.MerchantSettings }))
);

const MerchantPlans = lazy(() => 
  import('@/pages/merchant/plans/MerchantPlans').then(m => ({ default: m.MerchantPlans }))
);

// ============================================
// LAZY LOADING - PÁGINAS DO CUSTOMER
// ============================================
const CustomerLogin = lazy(() => 
  import('@/pages/customer/login/CustomerLogin').then(m => ({ default: m.CustomerLogin }))
);

const Profile = lazy(() => 
  import('@/pages/customer/profile/Profile').then(m => ({ default: m.Profile }))
);

const OrderConfirmation = lazy(() => 
  import('@/pages/customer/orders/OrderConfirmation').then(m => ({ default: m.OrderConfirmation }))
);

const OrdersList = lazy(() => 
  import('@/pages/customer/orders/ListOrders').then(m => ({ default: m.OrdersList }))
);

const MerchantCustomers = lazy(() => 
  import('@/pages/merchant/customers').then(m => ({ default: m.MerchantCustomers }))
);

// ============================================
// LAZY LOADING - CHECKOUT
// ============================================
const Checkout = lazy(() => 
  import('@/pages/public/Checkout/Checkout').then(m => ({ default: m.Checkout }))
);

function App() {
  return (
    <StoreProvider>
      <ThemeProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ========== ROTAS DE MERCHANT (ANTES DAS ROTAS PÚBLICAS) ========== */}
              {/* Login do Merchant */}
              <Route path="/merchant/login" element={<MerchantLoginWithContext />} />
              
              {/* Rotas protegidas do Merchant */}
              <Route path="/merchant" element={<MerchantLayout />}>
                <Route path="dashboard" element={<MerchantDashboard />} />
                <Route path="orders" element={<MerchantOrdersPage />} />
                <Route path="products" element={<MerchantProducts />} />
                <Route path="products/new" element={<ProductCreate />} />
                <Route path="customers" element={<MerchantCustomers />} />
                <Route path="settings" element={<MerchantSettings />} />
                <Route path="profile" element={<MerchantProfile />} />
                <Route path="plans" element={<MerchantPlans />} />
              </Route>

              {/* ========== ROTAS PÚBLICAS (Customer) ========== */}
              <Route element={<PublicLayoutWrapper />}>
                {/* Páginas principais - SEM lazy loading */}
                <Route path="/" element={<StoreFront />} />
                
                {/* Rotas com prefixo /loja/ */}
                <Route path="/loja/:storeId" element={<StorePage />} />
                
                {/* Páginas secundárias - COM lazy loading */}
                <Route path="/stores/:storeId" element={<OrderConfirmation />} />
                <Route path="/loja/:storeId/login" element={<CustomerLogin />} />
                <Route path="/stores/:storeId/login" element={<CustomerLogin />} />
                <Route path="/loja/:storeId/orders" element={<OrdersList />} />
                <Route path="/loja/:storeId/checkout" element={<Checkout />} />
                <Route path="/stores/:storeId/checkout" element={<Checkout />} />
                <Route path="/loja/:storeId/perfil" element={<Profile />} />
                <Route path="/stores/:storeId/perfil" element={<Profile />} />
                <Route path="/loja/:storeId/pedido/:orderId" element={<OrderConfirmation />} />
                <Route path="/stores/:storeId/pedido/:orderId" element={<OrderConfirmation />} />
                
                {/* Rota por slug direto (ex: /vex-sushi) - DEVE VIR POR ÚLTIMO */}
                {/* Esta rota captura qualquer path que não seja uma das rotas acima */}
                <Route path="/:storeId" element={<StorePage />} />
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    </StoreProvider>
  );
}

export default App;

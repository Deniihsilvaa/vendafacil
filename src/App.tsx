import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { 
  StoreProvider, 
  ThemeProvider, 
  AuthProvider, 
  CartProvider 
} from '@/contexts';
import { StoreFront } from '@/pages/public/StoreFront';
import { StorePage } from '@/pages/public/StorePage';
import { Checkout } from '@/pages/public/Checkout';
import { Profile } from '@/pages/customer/profile';
import { OrderConfirmation, OrdersList } from '@/pages/customer/orders';
import { MerchantDashboard } from '@/pages/merchant/dashboard';
import { MerchantProducts } from '@/pages/merchant/products';
import { MerchantOrdersPage } from '@/pages/merchant/orders';
import { MerchantSettings } from '@/pages/merchant/settings';
import { MerchantLayout } from '@/pages/merchant/MerchantLayout';
import { MerchantLoginWithContext } from '@/pages/merchant/login/MerchantLoginWithContext';
import { Toaster } from '@/components/ui/toast';

function App() {
  return (
    <StoreProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* ========== ROTAS PÚBLICAS (Customer) ========== */}
            {/* Estas rotas usam o AuthProvider para customers */}
            <Route element={
              <AuthProvider>
                <CartProvider>
                  <>
                    <Toaster />
                  </>
                </CartProvider>
              </AuthProvider>
            }>
              {/* Rota principal - StoreFront (lista de lojas ou loja padrão) */}
              <Route path="/" element={<StoreFront />} />
              
              {/* Rotas para loja específica por ID */}
              <Route path="/loja/:storeId" element={<StorePage />} />
              <Route path="/stores/:storeId" element={<OrderConfirmation />} />
              
              {/* Rotas para ver os pedidos do cliente */}
              <Route path="/loja/:storeId/orders" element={<OrdersList />} />
              
              {/* Rotas de checkout/finalização de pedido */}
              <Route path="/loja/:storeId/checkout" element={<Checkout />} />
              <Route path="/stores/:storeId/checkout" element={<Checkout />} />
              
              {/* Rotas de perfil do cliente */}
              <Route path="/loja/:storeId/perfil" element={<Profile />} />
              <Route path="/stores/:storeId/perfil" element={<Profile />} />
              
              {/* Rotas de confirmação de pedido */}
              <Route path="/loja/:storeId/pedido/:orderId" element={<OrderConfirmation />} />
              <Route path="/stores/:storeId/pedido/:orderId" element={<OrderConfirmation />} />
            </Route>
            
            {/* ========== ROTAS DE MERCHANT ========== */}
            {/* Login do Merchant (não precisa de proteção) */}
            <Route path="/merchant/login" element={<MerchantLoginWithContext />} />
            
            {/* Rotas protegidas do Merchant (usam MerchantAuthProvider) */}
            <Route path="/merchant" element={<MerchantLayout />}>
              <Route path="dashboard" element={<MerchantDashboard />} />
              <Route path="orders" element={<MerchantOrdersPage />} />
              <Route path="products" element={<MerchantProducts />} />
              <Route path="settings" element={<MerchantSettings />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </StoreProvider>
  );
}

export default App;

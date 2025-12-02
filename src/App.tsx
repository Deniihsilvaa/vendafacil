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
import { OrderConfirmation,OrdersList } from '@/pages/customer/orders';
import { MerchantDashboard } from '@/pages/merchant/dashboard';
import { MerchantLogin } from '@/pages/merchant/login';
import { MerchantProducts } from '@/pages/merchant/products';
import { MerchantOrdersPage } from '@/pages/merchant/orders';
import { MerchantSettings } from '@/pages/merchant/settings';
import { Toaster } from '@/components/ui/toast';

function App() {
  return (
    <StoreProvider>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <Router>
              <Routes>
                {/* Rota principal - StoreFront (lista de lojas ou loja padrão) */}
                <Route path="/" element={<StoreFront />} />
                
                {/* Rotas para loja específica por ID - suporta /loja/:storeId e /stores/:storeId */}
                <Route path="/loja/:storeId" element={<StorePage />} />
                <Route path="/stores/:storeId" element={<OrderConfirmation />} />
                
                {/*  Rotas para ver os pedido do cliente */}
                <Route path="/loja/:storeId/orders" element={<OrdersList/>} />
                
                {/* Rotas de checkout/finalização de pedido */}
                <Route path="/loja/:storeId/checkout" element={<Checkout />} />
                <Route path="/stores/:storeId/checkout" element={<Checkout />} />
                
                {/* Rotas de perfil do cliente */}
                <Route path="/loja/:storeId/perfil" element={<Profile />} />
                <Route path="/stores/:storeId/perfil" element={<Profile />} />
                
                {/* Rotas de confirmação de pedido */}
                <Route path="/loja/:storeId/pedido/:orderId" element={<OrderConfirmation />} />
                <Route path="/stores/:storeId/pedido/:orderId" element={<OrderConfirmation />} />
                
                {/* TODO: Rotas públicas */}
                {/* <Route path="/loja/:storeId/produto/:id" element={<ProductDetail />} /> */}
                {/* <Route path="/loja/:storeId/personalizar/:id" element={<CustomizeOrder />} /> */}
                
                {/* Rotas de autenticação */}
                <Route path="/merchant/login" element={<MerchantLogin />} />
                
                {/* TODO: Rotas do cliente */}
                {/* <Route path="/customer/login" element={<CustomerLogin />} /> */}
                {/* <Route path="/customer/orders" element={<CustomerOrders />} /> */}
                
                {/* Rotas do lojista */}
                <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
                <Route path="/merchant/orders" element={<MerchantOrdersPage />} />
                <Route path="/merchant/products" element={<MerchantProducts />} />
                <Route path="/merchant/settings" element={<MerchantSettings />} />
              </Routes>
            </Router>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </StoreProvider>
  );
}

export default App;

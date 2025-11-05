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
import { MerchantDashboard } from '@/pages/merchant/dashboard';
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
                
                {/* Rota para loja específica por ID */}
                <Route path="/loja/:storeId" element={<StorePage />} />
                
                {/* Rota de checkout/finalização de pedido */}
                <Route path="/loja/:storeId/checkout" element={<Checkout />} />
                
                {/* Rota de perfil do cliente */}
                <Route path="/loja/:storeId/perfil" element={<Profile />} />
                
                {/* TODO: Rotas públicas */}
                {/* <Route path="/loja/:storeId/produto/:id" element={<ProductDetail />} /> */}
                {/* <Route path="/loja/:storeId/personalizar/:id" element={<CustomizeOrder />} /> */}
                
                {/* TODO: Rotas de autenticação */}
                {/* <Route path="/customer/login" element={<CustomerLogin />} /> */}
                {/* <Route path="/merchant/login" element={<MerchantLogin />} /> */}
                
                {/* TODO: Rotas do cliente */}
                {/* <Route path="/customer/orders" element={<CustomerOrders />} /> */}
                
                {/* Rotas do lojista */}
                <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
                {/* <Route path="/merchant/products" element={<MerchantProducts />} /> */}
                {/* <Route path="/merchant/settings" element={<MerchantSettings />} /> */}
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

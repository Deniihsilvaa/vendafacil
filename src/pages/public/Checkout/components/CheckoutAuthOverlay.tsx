import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, CardContent, Input } from '@/components/ui';
import { Lock } from 'lucide-react';

interface CheckoutAuthOverlayProps {
  authMode: 'login' | 'signup';
  setAuthMode: (mode: 'login' | 'signup') => void;
  loginEmail: string;
  setLoginEmail: (email: string) => void;
  loginPassword: string;
  setLoginPassword: (password: string) => void;
  loginLoading: boolean;
  signupName: string;
  setSignupName: (name: string) => void;
  signupPhone: string;
  setSignupPhone: (phone: string) => void;
  handleLogin: (e: React.FormEvent) => void;
  handleSignup: (e: React.FormEvent) => void;
}

export const CheckoutAuthOverlay: React.FC<CheckoutAuthOverlayProps> = ({
  authMode,
  setAuthMode,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  loginLoading,
  signupName,
  setSignupName,
  signupPhone,
  setSignupPhone,
  handleLogin,
  handleSignup,
}) => {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();

  return (
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
      
      <CardContent className="p-6 opacity-50 pointer-events-none">
        <div className="space-y-4">
          <p className="text-muted-foreground">Faça login para ver o checkout</p>
        </div>
      </CardContent>
    </Card>
  );
};


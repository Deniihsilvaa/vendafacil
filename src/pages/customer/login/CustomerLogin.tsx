/**
 * Página dedicada de login e cadastro para customers (clientes)
 * Componente apenas com responsabilidade de UI
 * Lógica de negócio separada no hook useCustomerLogin
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Phone, ArrowLeft } from 'lucide-react';
import { PublicLayout, StoreLayout } from '@/components/layout';
import { Button } from '@/components/ui/buttons';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/cards';
import { LoadingState } from '@/components/shared/LoadingState';
import { useCustomerLogin } from './hooks/useCustomerLogin';

export const CustomerLogin: React.FC = () => {
  const navigate = useNavigate();
  const {
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
    signupEmail,
    setSignupEmail,
    signupPassword,
    setSignupPassword,
    signupLoading,
    authLoading,
    customer,
    storeId,
    handleLogin,
    handleSignup,
    isLoading,
  } = useCustomerLogin();

  // Se estiver carregando a autenticação, mostrar loading
  if (authLoading) {
    return (
      <StoreLayout>
        <LoadingState />
      </StoreLayout>
    );
  }

  // Se já estiver autenticado, não mostrar nada (será redirecionado)
  if (customer) {
    return null;
  }

  return (
    <PublicLayout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Botão voltar */}
          <Button
            variant="ghost"
            onClick={() => navigate(storeId ? `/loja/${storeId}` : '/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <Card className="shadow-lg">
            <CardHeader className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h1 className="text-2xl font-bold">
                {authMode === 'login' ? 'Acesso ao Perfil' : 'Criar Conta'}
              </h1>
              <p className="text-muted-foreground text-sm">
                {authMode === 'login'
                  ? 'Faça login para acessar seu perfil e acompanhar seus pedidos'
                  : 'Crie sua conta para começar a fazer pedidos'}
              </p>
            </CardHeader>

            <CardContent>
              {/* Tabs de Login/Signup */}
              <div className="flex gap-2 mb-6">
                <Button
                  type="button"
                  variant={authMode === 'login' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setAuthMode('login')}
                  disabled={isLoading}
                >
                  Entrar
                </Button>
                <Button
                  type="button"
                  variant={authMode === 'signup' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setAuthMode('signup')}
                  disabled={isLoading}
                >
                  Criar conta
                </Button>
              </div>

              {/* Formulário de Login */}
              {authMode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="login-email" className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={isLoading}
                      autoComplete="email"
                      autoFocus
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="login-password" className="text-sm font-medium flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Senha
                    </label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Digite sua senha"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={isLoading}
                      autoComplete="current-password"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading || !loginEmail.trim() || !loginPassword.trim()}
                    loading={loginLoading}
                  >
                    {loginLoading ? 'Entrando...' : 'Entrar e continuar'}
                  </Button>
                </form>
              ) : (
                /* Formulário de Signup */
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="signup-name" className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nome completo
                    </label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Seu nome"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      disabled={isLoading}
                      autoComplete="name"
                      minLength={2}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="signup-phone" className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Telefone
                    </label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="11999999999"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, ''))}
                      disabled={isLoading}
                      autoComplete="tel"
                      minLength={10}
                      maxLength={15}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="signup-email" className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      disabled={isLoading}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="signup-password" className="text-sm font-medium flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Senha (mínimo 6 caracteres)
                    </label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      disabled={isLoading}
                      autoComplete="new-password"
                      minLength={6}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={
                      isLoading ||
                      !signupEmail.trim() ||
                      !signupPassword ||
                      !signupName.trim() ||
                      !signupPhone.trim()
                    }
                    loading={signupLoading}
                  >
                    {signupLoading ? 'Criando conta...' : 'Criar conta e continuar'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
};


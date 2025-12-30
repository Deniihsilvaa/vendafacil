/**
 * Página dedicada de login e cadastro para customers (clientes)
 * Componente apenas com responsabilidade de UI
 * Lógica de negócio separada no hook useCustomerLogin
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Phone, ArrowLeft } from 'lucide-react';
import { PublicLayout } from '@/components/layout';
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
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingState />
        </div>
      </PublicLayout>
    );
  }

  // Se já estiver autenticado, não mostrar nada (será redirecionado)
  if (customer) {
    return null;
  }

  return (
    <PublicLayout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="w-full max-w-md">
          {/* Botão voltar */}
          <Button
            variant="ghost"
            onClick={() => navigate(storeId ? `/loja/${storeId}` : '/')}
            className="mb-6 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4 pb-6">
              <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-4 ring-4 ring-primary/5">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  {authMode === 'login' ? 'Bem-vindo de volta' : 'Criar conta'}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {authMode === 'login'
                    ? 'Entre na sua conta para continuar'
                    : 'Preencha seus dados para começar'}
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Tabs de Login/Signup */}
              <div className="relative">
                <div className="flex gap-1 p-1 bg-muted rounded-lg">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    disabled={isLoading}
                    className={`
                      flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200
                      ${authMode === 'login'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    Entrar
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    disabled={isLoading}
                    className={`
                      flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200
                      ${authMode === 'signup'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    Criar conta
                  </button>
                </div>
              </div>

              {/* Formulário de Login */}
              {authMode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <label 
                      htmlFor="login-email" 
                      className="text-sm font-medium text-foreground flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4 text-muted-foreground" />
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
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <label 
                      htmlFor="login-password" 
                      className="text-sm font-medium text-foreground flex items-center gap-2"
                    >
                      <Lock className="h-4 w-4 text-muted-foreground" />
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
                      className="h-11"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-medium"
                    disabled={isLoading || !loginEmail.trim() || !loginPassword.trim()}
                    loading={loginLoading}
                  >
                    {loginLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              ) : (
                /* Formulário de Signup */
                <form onSubmit={handleSignup} className="space-y-5">
                  <div className="space-y-2">
                    <label 
                      htmlFor="signup-name" 
                      className="text-sm font-medium text-foreground flex items-center gap-2"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      Nome completo
                    </label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      disabled={isLoading}
                      autoComplete="name"
                      minLength={2}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label 
                        htmlFor="signup-phone" 
                        className="text-sm font-medium text-foreground flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        Telefone
                      </label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, ''))}
                        disabled={isLoading}
                        autoComplete="tel"
                        minLength={10}
                        maxLength={15}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <label 
                        htmlFor="signup-email" 
                        className="text-sm font-medium text-foreground flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4 text-muted-foreground" />
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
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label 
                      htmlFor="signup-password" 
                      className="text-sm font-medium text-foreground flex items-center gap-2"
                    >
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      Senha
                    </label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      disabled={isLoading}
                      autoComplete="new-password"
                      minLength={6}
                      required
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground ml-6">
                      Use pelo menos 6 caracteres
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-medium"
                    disabled={
                      isLoading ||
                      !signupEmail.trim() ||
                      !signupPassword ||
                      !signupName.trim() ||
                      !signupPhone.trim()
                    }
                    loading={signupLoading}
                  >
                    {signupLoading ? 'Criando conta...' : 'Criar conta'}
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


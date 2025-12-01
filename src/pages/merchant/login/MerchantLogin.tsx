/**
 * Página de login para merchants (lojistas)
 * Permite login com email e senha
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Lock, Mail, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/cards';
import { Button } from '@/components/ui/buttons';
import { Input } from '@/components/ui/input';
import { useAuthContext } from '@/contexts';
import { showErrorToast, showSuccessToast } from '@/utils/toast';

export const MerchantLogin: React.FC = () => {
  const navigate = useNavigate();
  const { loginMerchant, user, isMerchant, loading: authLoading } = useAuthContext();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Redirecionar se já estiver logado como merchant
  useEffect(() => {
    if (user && isMerchant && !authLoading) {
      navigate('/merchant/dashboard');
    }
  }, [user, isMerchant, authLoading, navigate]);

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await loginMerchant({
        email,
        password,
      });
      showSuccessToast('Login realizado com sucesso!', 'Bem-vindo');
      
      // Redirecionar para dashboard após login bem-sucedido
      navigate('/merchant/dashboard');
    } catch (error) {
      console.error('Erro no login:', error);
      // O erro já é tratado pelo AuthContext e mostra toast
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center">
              <div className="p-3 bg-primary/10 rounded-full">
                <Store className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Área do Lojista
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Faça login para acessar seu painel administrativo
            </p>
          </div>

          {/* Formulário de Login */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold text-gray-900">Login</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      autoComplete="email"
                      className={`pl-10 ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                {/* Senha */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Senha <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      autoComplete="current-password"
                      className={`pl-10 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                {/* Botão de Submit */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>

              {/* Links auxiliares */}
              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Esqueceu sua senha?{' '}
                  <a
                    href="#"
                    className="font-medium text-primary hover:text-primary/80"
                    onClick={(e) => {
                      e.preventDefault();
                      // TODO: Implementar recuperação de senha
                      showErrorToast(new Error('Funcionalidade em desenvolvimento'), 'Em breve');
                    }}
                  >
                    Recuperar senha
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <a
                href="#"
                className="font-medium text-primary hover:text-primary/80"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Implementar cadastro de merchant
                  showErrorToast(new Error('Funcionalidade em desenvolvimento'), 'Em breve');
                }}
              >
                Entre em contato
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


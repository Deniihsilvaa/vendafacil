/**
 * Página de login e cadastro para merchants (lojistas)
 * Permite login e cadastro com email e senha
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Lock, Mail, Loader2, Building2, FileText, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/cards';
import { Button } from '@/components/ui/buttons';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/forms/Textarea';
import { useMerchantAuth } from '@/hooks/useMerchantAuth';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import type { MerchantSignupCredentials } from '@/types/auth';

const STORE_CATEGORIES = [
  { value: 'hamburgueria', label: 'Hamburgueria' },
  { value: 'pizzaria', label: 'Pizzaria' },
  { value: 'pastelaria', label: 'Pastelaria' },
  { value: 'sorveteria', label: 'Sorveteria' },
  { value: 'cafeteria', label: 'Cafeteria' },
  { value: 'padaria', label: 'Padaria' },
  { value: 'comida_brasileira', label: 'Comida Brasileira' },
  { value: 'comida_japonesa', label: 'Comida Japonesa' },
  { value: 'doces', label: 'Doces' },
  { value: 'mercado', label: 'Mercado' },
  { value: 'outros', label: 'Outros' },
] as const;

export const MerchantLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup, merchant, loading: authLoading } = useMerchantAuth();
  
  const [isSignup, setIsSignup] = useState(false);
  
  // Estados para login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Estados para signup
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [storeCategory, setStoreCategory] = useState<MerchantSignupCredentials['storeCategory']>('outros');
  const [customCategory, setCustomCategory] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirecionar se já estiver logado como merchant
  useEffect(() => {
    if (merchant && !authLoading) {
      navigate('/merchant/dashboard');
    }
  }, [merchant, authLoading, navigate]);

  const validateLoginForm = (): boolean => {
    const newErrors: Record<string, string> = {};

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

  const validateSignupForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!signupEmail.trim()) {
      newErrors.signupEmail = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) {
      newErrors.signupEmail = 'Email inválido';
    }

    if (!signupPassword) {
      newErrors.signupPassword = 'Senha é obrigatória';
    } else if (signupPassword.length < 6) {
      newErrors.signupPassword = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (!storeName.trim()) {
      newErrors.storeName = 'Nome da loja é obrigatório';
    } else if (storeName.trim().length < 2) {
      newErrors.storeName = 'Nome da loja deve ter no mínimo 2 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateLoginForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await login({
        email,
        password,
      });
      showSuccessToast('Login realizado com sucesso!', 'Bem-vindo');
      navigate('/merchant/dashboard');
    } catch (error) {
      console.error('Erro no login:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSignupForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const credentials: MerchantSignupCredentials = {
        email: signupEmail,
        password: signupPassword,
        storeName: storeName.trim(),
        storeDescription: storeDescription.trim() || undefined,
        storeCategory: storeCategory || 'outros',
        customCategory: customCategory.trim() || undefined,
      };

      await signup(credentials);
      // O signup já faz login automaticamente e redireciona
      navigate('/merchant/dashboard');
    } catch (error) {
      console.error('Erro no cadastro:', error);
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
              {isSignup ? 'Crie sua conta e comece a vender' : 'Faça login para acessar seu painel administrativo'}
            </p>
          </div>

          {/* Toggle entre Login e Signup */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setIsSignup(false);
                setErrors({});
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isSignup
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignup(true);
                setErrors({});
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isSignup
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cadastrar
            </button>
          </div>

          {/* Formulário de Login */}
          {!isSignup && (
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900">Login</h3>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLoginSubmit} className="space-y-6">
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
                        showErrorToast(new Error('Funcionalidade em desenvolvimento'), 'Em breve');
                      }}
                    >
                      Recuperar senha
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Formulário de Cadastro */}
          {isSignup && (
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900">Criar Conta</h3>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignupSubmit} className="space-y-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="signupEmail" className="text-sm font-medium text-foreground">
                      Email <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="signupEmail"
                        type="email"
                        placeholder="seu@email.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                        disabled={loading}
                        autoComplete="email"
                        className={`pl-10 ${errors.signupEmail ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      />
                    </div>
                    {errors.signupEmail && (
                      <p className="text-sm text-destructive">{errors.signupEmail}</p>
                    )}
                  </div>

                  {/* Senha */}
                  <div className="space-y-2">
                    <label htmlFor="signupPassword" className="text-sm font-medium text-foreground">
                      Senha <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="signupPassword"
                        type="password"
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        disabled={loading}
                        autoComplete="new-password"
                        className={`pl-10 ${errors.signupPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      />
                    </div>
                    {errors.signupPassword && (
                      <p className="text-sm text-destructive">{errors.signupPassword}</p>
                    )}
                    <p className="text-xs text-gray-500">Mínimo de 6 caracteres</p>
                  </div>

                  {/* Nome da Loja */}
                  <div className="space-y-2">
                    <label htmlFor="storeName" className="text-sm font-medium text-foreground">
                      Nome da Loja <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="storeName"
                        type="text"
                        placeholder="Ex: Minha Loja"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        required
                        disabled={loading}
                        className={`pl-10 ${errors.storeName ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      />
                    </div>
                    {errors.storeName && (
                      <p className="text-sm text-destructive">{errors.storeName}</p>
                    )}
                  </div>

                  {/* Descrição da Loja */}
                  <div className="space-y-2">
                    <label htmlFor="storeDescription" className="text-sm font-medium text-foreground">
                      Descrição da Loja <span className="text-gray-400 text-xs">(opcional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <Textarea
                        id="storeDescription"
                        placeholder="Descreva sua loja..."
                        value={storeDescription}
                        onChange={(e) => setStoreDescription(e.target.value)}
                        disabled={loading}
                        rows={3}
                        className={`pl-10 ${errors.storeDescription ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      />
                    </div>
                  </div>

                  {/* Categoria da Loja */}
                  <div className="space-y-2">
                    <label htmlFor="storeCategory" className="text-sm font-medium text-foreground">
                      Categoria <span className="text-gray-400 text-xs">(opcional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Tag className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="storeCategory"
                        value={storeCategory}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStoreCategory(e.target.value as MerchantSignupCredentials['storeCategory'])}
                        disabled={loading}
                        className={`w-full pl-10 pr-4 py-2 border rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.storeCategory ? 'border-destructive focus:ring-destructive' : 'border-gray-300'
                        }`}
                      >
                        {STORE_CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Categoria Customizada */}
                  {storeCategory === 'outros' && (
                    <div className="space-y-2">
                      <label htmlFor="customCategory" className="text-sm font-medium text-foreground">
                        Categoria Personalizada <span className="text-gray-400 text-xs">(opcional)</span>
                      </label>
                      <Input
                        id="customCategory"
                        type="text"
                        placeholder="Ex: Food Truck, Lanchonete..."
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        disabled={loading}
                        className={errors.customCategory ? 'border-destructive focus-visible:ring-destructive' : ''}
                      />
                    </div>
                  )}

                  {/* Botão de Submit */}
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    loading={loading}
                    disabled={loading}
                  >
                    {loading ? 'Criando conta...' : 'Criar Conta'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          {!isSignup && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <button
                  type="button"
                  className="font-medium text-primary hover:text-primary/80"
                  onClick={() => setIsSignup(true)}
                >
                  Cadastre-se aqui
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Hook para gerenciar lógica de autenticação do customer
 * Separa a lógica de negócio da apresentação
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts';
import { AuthService } from '@/services/auth/authService';
import { showErrorToast } from '@/utils/toast';

export const useCustomerLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { storeId } = useParams<{ storeId: string }>();
  const { customer, loading: authLoading, login } = useAuthContext();

  // Estado do modo (login ou signup)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Estados para login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Estados para signup
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  // Ref para evitar múltiplos redirecionamentos
  const hasRedirectedRef = useRef(false);
  
  // Resetar o ref quando o customer mudar para null (logout)
  useEffect(() => {
    if (!customer && !authLoading) {
      hasRedirectedRef.current = false;
    }
  }, [customer, authLoading]);

  // Obter destino de redirecionamento (location.state ou query params)
  const redirectTo = useMemo(() => {
    const from = location.state?.from;
    const fromQuery = new URLSearchParams(location.search).get('redirect');
    return from || fromQuery || null;
  }, [location.state?.from, location.search]);

  // Validação de email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Redirecionar se já estiver autenticado (ao carregar a página ou após login)
  useEffect(() => {
    // Verificar se temos customer autenticado e não está carregando
    if (customer && !authLoading && storeId && !hasRedirectedRef.current) {
      const currentPath = location.pathname;
      const loginPath = `/loja/${storeId}/login`;
      
      let destination = redirectTo || `/loja/${storeId}/perfil`;
      
      // Se o destino for a própria página de login, usar perfil como fallback
      if (destination === loginPath || destination === currentPath) {
        destination = `/loja/${storeId}/perfil`;
      }
      
      // Se já estamos na rota de destino, não navegar
      if (destination === currentPath) {
        hasRedirectedRef.current = true;
        return;
      }
      
      // Marcar que já redirecionamos antes de navegar
      hasRedirectedRef.current = true;
      
      // Adicionar um pequeno delay para garantir que o toast seja exibido
      // e que o estado do customer esteja completamente atualizado
      const timer = setTimeout(() => {
        navigate(destination, { replace: true });
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [customer, authLoading, navigate, redirectTo, storeId, location.pathname, loginLoading, signupLoading]);

  // Handler para login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeId) {
      showErrorToast(new Error('Loja não encontrada'), 'Erro');
      return;
    }

    if (!loginEmail.trim() || !loginPassword.trim()) {
      showErrorToast(new Error('Preencha email e senha'), 'Erro');
      return;
    }

    if (!validateEmail(loginEmail)) {
      showErrorToast(new Error('Email inválido'), 'Erro');
      return;
    }

    if (loginPassword.length < 6) {
      showErrorToast(new Error('A senha deve ter no mínimo 6 caracteres'), 'Erro');
      return;
    }

    setLoginLoading(true);
    try {
      await login({
        email: loginEmail.trim(),
        password: loginPassword,
        storeId,
      });
      
      // Limpar campos após login bem-sucedido
      setLoginEmail('');
      setLoginPassword('');
      
      // Resetar o ref para permitir redirecionamento
      hasRedirectedRef.current = false;
      
      // Redirecionar após um pequeno delay para garantir que o customer foi atualizado
      const destination = redirectTo || `/loja/${storeId}/perfil`;
      console.log('destination', destination);
      setTimeout(() => {
        hasRedirectedRef.current = true;
        navigate(destination, { replace: true });
      }, 300);
    } catch (error) {
      console.error('Erro no login:', error);
    } finally {
      setLoginLoading(false);
    }
  };

  // Handler para signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeId) {
      showErrorToast(new Error('Loja não encontrada'), 'Erro');
      return;
    }

    if (!signupEmail.trim() || !signupPassword || !signupName.trim() || !signupPhone.trim()) {
      showErrorToast(new Error('Preencha todos os campos'), 'Erro');
      return;
    }

    if (!validateEmail(signupEmail)) {
      showErrorToast(new Error('Email inválido'), 'Erro');
      return;
    }

    if (signupPassword.length < 6) {
      showErrorToast(new Error('A senha deve ter no mínimo 6 caracteres'), 'Erro');
      return;
    }

    if (signupPhone.length < 10 || signupPhone.length > 15) {
      showErrorToast(new Error('Telefone inválido'), 'Erro');
      return;
    }

    setSignupLoading(true);
    try {
      // Criar conta
      await AuthService.customerSignup(
        signupEmail.trim(),
        signupPassword,
        storeId,
        signupName.trim(),
        signupPhone.trim()
      );

      // Fazer login automaticamente após criar conta
      await login({
        email: signupEmail.trim(),
        password: signupPassword,
        storeId,
      });
      
      // Limpar campos após cadastro e login bem-sucedidos
      setSignupEmail('');
      setSignupPassword('');
      setSignupName('');
      setSignupPhone('');
      
      // Resetar o ref para permitir redirecionamento
      hasRedirectedRef.current = false;
      
      // Redirecionar após um pequeno delay para garantir que o customer foi atualizado
      const destination = redirectTo || `/loja/${storeId}/perfil`;
      setTimeout(() => {
        hasRedirectedRef.current = true;
        navigate(destination, { replace: true });
      }, 300);
      
      // O redirecionamento será feito pelo useEffect quando customer mudar
      // Isso garante que o estado foi atualizado corretamente
    } catch (error) {
      console.error('Erro no cadastro:', error);
    } finally {
      setSignupLoading(false);
    }
  };

  return {
    // Estados
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
    
    // Handlers
    handleLogin,
    handleSignup,
    
    // Helpers
    isLoading: loginLoading || signupLoading,
  };
};


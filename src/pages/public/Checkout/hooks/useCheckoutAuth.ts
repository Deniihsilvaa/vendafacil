import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthContext } from '@/contexts';
import { showErrorToast } from '@/utils/toast';
import { AuthService } from '@/services/auth/authService';

export const useCheckoutAuth = () => {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();
  const { customer, loading: authLoading, login } = useAuthContext();
  
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasToken(!!localStorage.getItem('store-flow-token'));
    }
  }, [customer]);

  const isNotAuthenticated = !authLoading && (!customer || !hasToken);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!storeId) {
      showErrorToast(new Error('Loja não encontrada'), 'Erro');
      return;
    }
    
    if (!loginEmail || !loginPassword) {
      showErrorToast(new Error('Preencha email e senha'), 'Erro');
      return;
    }
    
    setLoginLoading(true);
    try {
      await login({
        email: loginEmail,
        password: loginPassword,
        storeId,
      });
      setLoginEmail('');
      setLoginPassword('');
    } catch (error) {
      console.error('Erro no login:', error);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!storeId) {
      showErrorToast(new Error('Loja não encontrada'), 'Erro');
      return;
    }
    
    if (!loginEmail || !loginPassword || !signupName || !signupPhone) {
      showErrorToast(new Error('Preencha todos os campos'), 'Erro');
      return;
    }
    
    if (loginPassword.length < 6) {
      showErrorToast(new Error('A senha deve ter no mínimo 6 caracteres'), 'Erro');
      return;
    }
    
    if (signupPhone.length < 10 || signupPhone.length > 15) {
      showErrorToast(new Error('Telefone inválido'), 'Erro');
      return;
    }
    
    setLoginLoading(true);
    try {
      await AuthService.customerSignup(loginEmail, loginPassword, storeId, signupName, signupPhone);
      await login({
        email: loginEmail,
        password: loginPassword,
        storeId,
      });
      setLoginEmail('');
      setLoginPassword('');
      setSignupName('');
      setSignupPhone('');
    } catch (error) {
      console.error('Erro no cadastro:', error);
    } finally {
      setLoginLoading(false);
    }
  };

  return {
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
    isNotAuthenticated,
    handleLogin,
    handleSignup,
    storeId,
    navigate,
  };
};


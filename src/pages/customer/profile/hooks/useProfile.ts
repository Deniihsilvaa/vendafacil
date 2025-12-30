/**
 * Hook para gerenciar lógica de perfil do customer
 * Separa a lógica de negócio da apresentação
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts';
import { AuthService } from '@/services/auth/authService';
import { formatZipCode, unformatZipCode, getLocalISOString } from '@/utils';
import { consultarCep, validarFormatoCep, cepIncompleto } from '@/services/external/viaCepService';
import { showSuccessToast, showErrorToast, showInfoToast } from '@/utils/toast';
import type { DeliveryAddress, Customer } from '@/types';

export const useProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { storeId } = useParams<{ storeId: string }>();
  const { customer, loading, updateCustomer, logout } = useAuthContext();

  // Estados para edição de informações pessoais
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');

  // Estados para edição de endereços
  const [editingAddress, setEditingAddress] = useState<'home' | 'work' | null>(null);
  const [editedAddress, setEditedAddress] = useState<Partial<DeliveryAddress & { isDefault: boolean }>>({});
  
  // Estados para CEP e tipo de logradouro
  const [streetType, setStreetType] = useState<string>('');
  const [loadingCep, setLoadingCep] = useState(false);
  const cepIncompletoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Função para buscar CEP via ViaCEP
  const buscarCep = useCallback(async (cep: string, isManual = false) => {
    const cepLimpo = unformatZipCode(cep);
    
    if (!validarFormatoCep(cepLimpo)) {
      if (isManual) {
        showErrorToast('CEP inválido. Digite um CEP com 8 dígitos.', 'CEP Inválido');
      }
      return;
    }

    try {
      setLoadingCep(true);
      const dadosCep = await consultarCep(cepLimpo);

      if (!dadosCep) {
        if (isManual) {
          showErrorToast('CEP não encontrado. Verifique o CEP digitado.', 'CEP não encontrado');
        }
        return;
      }

      setEditedAddress(prev => ({
        ...prev,
        street: dadosCep.logradouro || prev.street,
        neighborhood: dadosCep.bairro || prev.neighborhood,
        city: dadosCep.localidade || prev.city,
        state: dadosCep.uf || prev.state,
        zipCode: formatZipCode(dadosCep.cep),
      }));

      if (isManual) {
        showSuccessToast('Endereço encontrado e preenchido automaticamente!', 'CEP encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      if (isManual) {
        showErrorToast('Erro ao buscar CEP. Tente novamente.', 'Erro na busca');
      }
    } finally {
      setLoadingCep(false);
    }
  }, []);

  // Função para lidar com mudança no CEP
  const handleCepChange = useCallback((cep: string) => {
    setEditedAddress(prev => ({
      ...prev,
      zipCode: cep,
    }));

    if (cepIncompletoTimeoutRef.current) {
      clearTimeout(cepIncompletoTimeoutRef.current);
      cepIncompletoTimeoutRef.current = null;
    }

    const cepLimpo = unformatZipCode(cep);

    if (validarFormatoCep(cepLimpo)) {
      buscarCep(cep, false);
    } else if (cepIncompleto(cep)) {
      cepIncompletoTimeoutRef.current = setTimeout(() => {
        showInfoToast('CEP incompleto. Digite os 8 dígitos para buscar automaticamente.', 'CEP incompleto');
      }, 5000);
    }
  }, [buscarCep]);

  // Cleanup do timeout
  useEffect(() => {
    return () => {
      if (cepIncompletoTimeoutRef.current) {
        clearTimeout(cepIncompletoTimeoutRef.current);
      }
    };
  }, []);

  // Redirecionar para login se não estiver autenticado
  // Só redirecionar se realmente não houver customer (aguardar o AuthContext terminar de carregar)
  useEffect(() => {
    if (!loading && !customer) {
      // Verificar se há token ou customer no localStorage antes de redirecionar
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('store-flow-token')
        : null;
      const savedCustomer = typeof window !== 'undefined'
        ? localStorage.getItem('store-flow-customer')
        : null;
      
      // Só redirecionar se não houver nem token nem customer salvo
      if (!token && !savedCustomer) {
        navigate(`/loja/${storeId}/login`, {
          state: { from: location.pathname },
          replace: true,
        });
      }
    }
  }, [loading, customer, navigate, storeId, location.pathname]);

  // Funções para informações pessoais
  const handleStartEdit = useCallback(() => {
    if (!customer) return;
    setEditedName(customer.name);
    setEditedPhone(customer.phone);
    setIsEditingPersonalInfo(true);
  }, [customer]);

  const handleCancelEdit = useCallback(() => {
    setIsEditingPersonalInfo(false);
    setEditedName('');
    setEditedPhone('');
  }, []);

  const handleSavePersonalInfo = useCallback(async () => {
    if (!customer) return;
    
    const updatedCustomer = {
      ...customer,
      name: editedName.trim(),
      phone: editedPhone.trim(),
      updatedAt: getLocalISOString(),
    };

    await updateCustomer(updatedCustomer);
    setIsEditingPersonalInfo(false);
  }, [customer, editedName, editedPhone, updateCustomer]);

  // Funções para edição de endereços
  const handleStartEditAddress = useCallback((type: 'home' | 'work') => {
    if (!customer) return;
    const address = type === 'home' ? customer.addresses?.home : customer.addresses?.work;
    setEditingAddress(type);
    
    // Extrair tipo de logradouro do nome da rua
    let extractedStreetType = '';
    let extractedStreetName = address?.street || '';
    
    const tipos = ['Rua', 'Avenida', 'Av', 'Travessa', 'Trav', 'Alameda', 'Praça', 'Estrada', 'Rodovia'];
    for (const tipo of tipos) {
      if (extractedStreetName.trim().toLowerCase().startsWith(tipo.toLowerCase() + ' ')) {
        extractedStreetType = tipo;
        extractedStreetName = extractedStreetName.substring(tipo.length).trim();
        break;
      }
    }
    
    setStreetType(extractedStreetType);
    setEditedAddress({
      street: extractedStreetName,
      number: address?.number || '',
      neighborhood: address?.neighborhood || '',
      city: address?.city || '',
      state: address?.state || '',
      zipCode: address?.zipCode || '',
      complement: address?.complement || '',
      reference: address?.reference || '',
      isDefault: address?.isDefault || false,
    });
  }, [customer]);

  const handleCancelEditAddress = useCallback(() => {
    setEditingAddress(null);
    setEditedAddress({});
    setStreetType('');
  }, []);

  const handleSaveAddress = useCallback(async (type: 'home' | 'work') => {
    if (!customer) return;
    
    if (!editedAddress.street || !editedAddress.number || !editedAddress.neighborhood ||
      !editedAddress.city || !editedAddress.state || !editedAddress.zipCode) {
      showErrorToast('Preencha todos os campos obrigatórios.', 'Campos obrigatórios');
      return;
    }

    let streetName = editedAddress.street!;
    if (streetType && streetType.trim()) {
      streetName = `${streetType} ${editedAddress.street}`.trim();
    }

    try {
      const existingAddress = customer.addresses?.[type];
      const addressId = existingAddress && 'id' in existingAddress 
        ? (existingAddress as DeliveryAddress & { id?: string; label?: string; isDefault?: boolean; updatedAt?: string }).id 
        : undefined;

      // Determinar se deve ser default
      let isDefault = editedAddress.isDefault || false;
      if (!isDefault && !customer.addresses?.home?.isDefault && !customer.addresses?.work?.isDefault) {
        isDefault = true;
      }

      const addressData = {
        label: type === 'home' ? 'Casa' : 'Trabalho',
        addressType: type,
        street: streetName,
        number: editedAddress.number!,
        neighborhood: editedAddress.neighborhood!,
        city: editedAddress.city!,
        state: editedAddress.state!,
        zipCode: editedAddress.zipCode!,
        complement: editedAddress.complement?.trim() || undefined,
        reference: editedAddress.reference?.trim() || undefined,
        isDefault,
      };

      if (addressId) {
        // Atualizar endereço existente
        await AuthService.updateAddress(addressId, addressData);
        
        // Se este endereço virou default, atualizar o outro para não ser default
        if (isDefault && customer.addresses?.[type === 'home' ? 'work' : 'home']) {
          const otherAddress = customer.addresses[type === 'home' ? 'work' : 'home']!;
          const otherId = (otherAddress as DeliveryAddress & { id?: string }).id;
          if (otherId) {
            await AuthService.updateAddress(otherId, { isDefault: false });
          }
        }
      } else {
        // Criar novo endereço
        await AuthService.createAddress(addressData);
        
        // Se este endereço virou default, atualizar o outro para não ser default
        if (isDefault && customer.addresses?.[type === 'home' ? 'work' : 'home']) {
          const otherAddress = customer.addresses[type === 'home' ? 'work' : 'home']!;
          const otherId = (otherAddress as DeliveryAddress & { id?: string }).id;
          if (otherId) {
            await AuthService.updateAddress(otherId, { isDefault: false });
          }
        }
      }

      // Recarregar perfil completo para ter os endereços atualizados
      const updatedProfile = await AuthService.getProfile();
      updateCustomer(updatedProfile as Customer);

      showSuccessToast('Endereço salvo com sucesso!');
      setEditingAddress(null);
      setEditedAddress({});
      setStreetType('');
    } catch (error) {
      console.error('Erro ao salvar endereço:', error);
      showErrorToast(error as Error, 'Erro ao salvar endereço');
    }
  }, [customer, editedAddress, streetType, updateCustomer]);

  const handleSetDefaultAddress = useCallback(async (type: 'home' | 'work') => {
    if (!customer) return;
    
    const address = customer.addresses?.[type];
    if (!address) return;

    const addressId = (address as DeliveryAddress & { id?: string }).id;
    if (!addressId) return;

    try {
      // Atualizar este endereço para default
      await AuthService.updateAddress(addressId, { isDefault: true });

      // Atualizar o outro endereço para não ser default
      const otherType = type === 'home' ? 'work' : 'home';
      const otherAddress = customer.addresses?.[otherType];
      if (otherAddress) {
        const otherId = (otherAddress as DeliveryAddress & { id?: string }).id;
        if (otherId) {
          await AuthService.updateAddress(otherId, { isDefault: false });
        }
      }

      // Recarregar perfil completo
      const updatedProfile = await AuthService.getProfile();
      updateCustomer(updatedProfile as Customer);

      showSuccessToast('Endereço padrão atualizado!');
    } catch (error) {
      console.error('Erro ao definir endereço padrão:', error);
      showErrorToast(error as Error, 'Erro ao definir endereço padrão');
    }
  }, [customer, updateCustomer]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      // Redirecionar para a página inicial da loja
      navigate(`/loja/${storeId}`, { replace: true });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }, [logout, navigate, storeId]);

  return {
    customer,
    loading,
    storeId,
    // Estados de edição pessoal
    isEditingPersonalInfo,
    editedName,
    setEditedName,
    editedPhone,
    setEditedPhone,
    handleStartEdit,
    handleCancelEdit,
    handleSavePersonalInfo,
    // Estados de edição de endereços
    editingAddress,
    editedAddress,
    setEditedAddress,
    streetType,
    setStreetType,
    loadingCep,
    handleStartEditAddress,
    handleCancelEditAddress,
    handleSaveAddress,
    handleSetDefaultAddress,
    handleCepChange,
    buscarCep,
    // Logout
    handleLogout,
  };
};


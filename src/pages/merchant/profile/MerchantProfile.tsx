/**
 * Página de perfil do lojista (merchant)
 * Permite editar informações do lojista
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Settings, Building2, Save } from 'lucide-react';
import { MerchantLayout } from '@/components/layout/MerchantLayout';
import { Button } from '@/components/ui/buttons';

import { LoadingState } from '@/components/shared/LoadingState';
import { useMerchantAuth } from '@/hooks/useMerchantAuth';
import { StoreService, type UpdateStorePayload } from '@/services/stores/storeService';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { unformatZipCode } from '@/utils/format';
import {  type AddressFormData } from '@/components/forms/AddressForm';
import type { Store } from '@/types/store';


export const MerchantProfile: React.FC = () => {
  const { merchant } = useMerchantAuth();
  const [loading, setLoading] = useState(false);
  const [loadingStore, setLoadingStore] = useState(true);

  // Estados do formulário - Informações Básicas
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [storeCategory, setStoreCategory] = useState<string>('outros');

  // Estado do formulário - Endereço da Loja
  const [storeAddress, setStoreAddress] = useState<AddressFormData>({
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  });

  // Estados do formulário - Horários de Funcionamento
  const [workingHours, setWorkingHours] = useState<Store['info']['workingHours']>({
    monday: { open: '08:00', close: '18:00', closed: false },
    tuesday: { open: '08:00', close: '18:00', closed: false },
    wednesday: { open: '08:00', close: '18:00', closed: false },
    thursday: { open: '08:00', close: '18:00', closed: false },
    friday: { open: '08:00', close: '18:00', closed: false },
    saturday: { open: '08:00', close: '18:00', closed: false },
    sunday: { open: '08:00', close: '18:00', closed: false },
  });

  // Estados do formulário - Configurações
  const [isActive, setIsActive] = useState(true);
  const [deliveryTime, setDeliveryTime] = useState('');
  const [minOrderValue, setMinOrderValue] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [freeDeliveryAbove, setFreeDeliveryAbove] = useState(0);

  // Estados do formulário - Métodos de Pagamento
  const [acceptsPayment, setAcceptsPayment] = useState({
    creditCard: true,
    debitCard: true,
    pix: true,
    cash: true,
  });

  // Estados do formulário - Tema
  const [theme, setTheme] = useState<{
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    textColor: string;
  }>({
    primaryColor: '#DC2626',
    secondaryColor: '#2563EB',
    accentColor: '#059669',
    textColor: '#FFFFFF',
  });

  // Obter storeId do merchant
  const storeId = useMemo(() => {
    try {
      const savedMerchantStr = localStorage.getItem('store-flow-merchant');
      if (savedMerchantStr) {
        const savedMerchant = JSON.parse(savedMerchantStr);
        if ('role' in savedMerchant && 'stores' in savedMerchant && savedMerchant.stores) {
          if (savedMerchant.stores.length > 0) {
            if (savedMerchant.stores.length === 1) {
              return savedMerchant.stores[0].id;
            }
            const activeStore = savedMerchant.stores.find((store: { is_active: boolean }) => store.is_active);
            if (activeStore) return activeStore.id;
            return savedMerchant.stores[0]?.id || null;
          }
        }
        if (savedMerchant?.storeId) {
          return savedMerchant.storeId;
        }
      }
    } catch (error) {
      console.error('Erro ao ler localStorage:', error);
    }

    if (!merchant || !merchant.stores) {
      return null;
    }
    if (merchant.stores.length === 1) {
      return merchant.stores[0].id;
    }
    const activeStore = merchant.stores.find(store => store.is_active);
    return activeStore?.id || merchant.stores[0]?.id || null;
  }, [merchant]);

  // Carregar dados da loja
  useEffect(() => {
    const loadStore = async () => {
      if (!storeId) {
        setLoadingStore(false);
        return;
      }

      try {
        setLoadingStore(true);
        const storeData = await StoreService.getStoreById(storeId);
        console.log('🔍 Dados da loja carregados:', storeData);

        // Preencher formulários com dados da loja
        setStoreName(storeData.name || '');
        setStoreSlug(storeData.slug || '');
        setStoreDescription(storeData.description || '');
        setStoreCategory(storeData.category || 'outros');
        
        // Verificar se info existe antes de acessar
        const address = storeData.info?.address || {};
        setStoreAddress({
          street: address.street || '',
          number: address.number || '',
          neighborhood: address.neighborhood || '',
          city: address.city || '',
          state: address.state || '',
          zipCode: address.zipCode || '',
        });
        
        // Verificar se workingHours existe e garantir que todos os dias estejam presentes
        const defaultWorkingHours = {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: false },
          saturday: { open: '09:00', close: '18:00', closed: true },
          sunday: { open: '09:00', close: '18:00', closed: true },
        };
        
        // Merge com os dados da API para garantir que todos os dias existam
        const workingHoursData = {
          ...defaultWorkingHours,
          ...(storeData.info?.workingHours || {}),
        };
        
        setWorkingHours(workingHoursData);
        
        // Verificar se settings existe antes de acessar
        const settings = storeData.settings || {};
        setIsActive(settings.isActive || false);
        setDeliveryTime(settings.deliveryTime || '');
        setMinOrderValue(settings.minOrderValue || 0);
        setDeliveryFee(settings.deliveryFee || 0);
        setFreeDeliveryAbove(settings.freeDeliveryAbove || 0);
        setAcceptsPayment(settings.acceptsPayment || {
          creditCard: false,
          debitCard: false,
          pix: false,
          cash: false,
        });
        
        // Verificar se theme existe antes de acessar
        const themeData = storeData.theme || {};
        setTheme({
          primaryColor: themeData.primaryColor || '#DC2626',
          secondaryColor: themeData.secondaryColor || '#2563EB',
          accentColor: themeData.accentColor || '#059669',
          textColor: themeData.textColor || '#FFFFFF',
        });
      } catch (error) {
        console.error('Erro ao carregar loja:', error);
        showErrorToast(error as Error, 'Erro ao carregar informações da loja');
      } finally {
        setLoadingStore(false);
      }
    };

    loadStore();
  }, [storeId]);

  const handleSaveStore = async () => {
    if (!storeId) {
      showErrorToast(new Error('Loja não encontrada'), 'Erro');
      return;
    }

    try {
      setLoading(true);

      const updatePayload: UpdateStorePayload = {
        id: storeId, // Incluir o ID da loja para identificação
        name: storeName.trim() || undefined,
        slug: storeSlug.trim() || undefined,
        description: storeDescription.trim() || undefined,
        category: storeCategory || undefined,
        address: {
          street: storeAddress.street,
          number: storeAddress.number,
          neighborhood: storeAddress.neighborhood,
          city: storeAddress.city,
          state: storeAddress.state,
          zipCode: unformatZipCode(storeAddress.zipCode),
        },
        workingHours,
        settings: {
          isActive,
          deliveryTime: deliveryTime || undefined,
          minOrderValue,
          deliveryFee,
          freeDeliveryAbove,
          acceptsPayment,
        },
        theme,
      };

      console.log('📤 Enviando payload para atualizar loja:', {
        storeId,
        hasName: !!updatePayload.name,
        hasSlug: !!updatePayload.slug,
        hasAddress: !!updatePayload.address,
        hasSettings: !!updatePayload.settings,
        hasTheme: !!updatePayload.theme,
      });

      // Salvar e usar os dados retornados pela API (evita chamada duplicada)
      const updatedStore = await StoreService.updateStore(storeId, updatePayload);
      
      console.log('✅ Dados retornados da API:', updatedStore);
      
      // Atualizar estados locais com os dados retornados
      setStoreName(updatedStore.name || '');
      setStoreSlug(updatedStore.slug || '');
      setStoreDescription(updatedStore.description || '');
      setStoreCategory(updatedStore.category || 'outros');
      
      // Verificar se info existe antes de acessar
      const updatedAddress = updatedStore.info?.address || {};
      setStoreAddress({
        street: updatedAddress.street || '',
        number: updatedAddress.number || '',
        neighborhood: updatedAddress.neighborhood || '',
        city: updatedAddress.city || '',
        state: updatedAddress.state || '',
        zipCode: updatedAddress.zipCode || '',
      });
      
      // Verificar se workingHours existe e fazer merge com valores padrão
      const updatedWorkingHours = {
        ...workingHours,
        ...(updatedStore.info?.workingHours || {}),
      };
      setWorkingHours(updatedWorkingHours);
      
      // Verificar se settings existe antes de acessar
      const updatedSettings = updatedStore.settings || {};
      setIsActive(updatedSettings.isActive || false);
      setDeliveryTime(updatedSettings.deliveryTime || '');
      setMinOrderValue(updatedSettings.minOrderValue || 0);
      setDeliveryFee(updatedSettings.deliveryFee || 0);
      setFreeDeliveryAbove(updatedSettings.freeDeliveryAbove || 0);
      setAcceptsPayment(updatedSettings.acceptsPayment || acceptsPayment);
      
      // Verificar se theme existe antes de acessar
      const updatedTheme = updatedStore.theme || {};
      setTheme({
        primaryColor: updatedTheme.primaryColor || '#DC2626',
        secondaryColor: updatedTheme.secondaryColor || '#2563EB',
        accentColor: updatedTheme.accentColor || '#059669',
        textColor: updatedTheme.textColor || '#FFFFFF',
      });
      
      // Aguardar um pouco para garantir que o estado foi atualizado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Mostrar notificação de sucesso
      showSuccessToast('Configurações da loja atualizadas com sucesso!', 'Sucesso');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      showErrorToast(error as Error, 'Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };



  if (loadingStore) {
    return (
      <MerchantLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingState size="lg" />
        </div>
      </MerchantLayout>
    );
  }

  if (!storeId) {
    return (
      <MerchantLayout>
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700">Nenhuma loja encontrada</p>
          <p className="text-sm text-gray-500">Entre em contato com o suporte para associar sua conta a uma loja.</p>
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout>
      {/* Overlay de Loading durante salvamento */}
      {loading && (
        <LoadingState 
          message="Salvando configurações... Por favor, aguarde enquanto suas alterações são salvas."
          size="lg"
          fullScreen
        />
      )}
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            Configurações da Loja
          </h1>
          <p className="text-gray-600 mt-2">Perfil do lojista</p>
          <p className="text-gray-600 mt-2">Gerencie as informações e configurações da sua loja</p>
        </div>

   
        {/* Botão de Salvar */}
        <div className="flex justify-end gap-4">
          <Button
            onClick={handleSaveStore}
            loading={loading}
            disabled={loading}
            size="lg"
            className="min-w-[150px]"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>
    </MerchantLayout>
  );
};

/**
 * Página de configurações da loja (merchant)
 * Permite editar informações da loja, endereço, horários, configurações e tema
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Settings, Building2, MapPin, Clock, DollarSign, Palette, CreditCard, Save, Search } from 'lucide-react';
import { MerchantLayout } from '@/components/layout/MerchantLayout';
import { Button } from '@/components/ui/buttons';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/forms/Textarea';
import { Switch } from '@/components/ui/switch/Switch';
import { LoadingState } from '@/components/shared/LoadingState';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useMerchantAuth } from '@/hooks/useMerchantAuth';
import { StoreService } from '@/services/stores/storeService';
import { showSuccessToast, showErrorToast, showInfoToast } from '@/utils/toast';
import { unformatZipCode, formatZipCode } from '@/utils/format';
import { AddressForm, type AddressFormData } from '@/components/forms/AddressForm';
import type { Store, ApiWorkingHoursItem } from '@/types/index';
import { STORE_CATEGORIES, DAYS_OF_WEEK } from '@/constants/stores';
import {
  convertApiWorkingHoursToObject,
  convertObjectToApiWorkingHours,
} from '@/utils/workingHoursFormat';
import { consultarCep, validarFormatoCep, cepIncompleto } from '@/services/external/viaCepService';


export const MerchantSettings: React.FC = () => {
  const { merchant } = useMerchantAuth();
  const [loadingStore, setLoadingStore] = useState(true);
  
  // Estados de loading separados para cada seção
  const [loadingBasicInfo, setLoadingBasicInfo] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [loadingWorkingHours, setLoadingWorkingHours] = useState(false);
  const [loadingDeliverySettings, setLoadingDeliverySettings] = useState(false);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [loadingTheme, setLoadingTheme] = useState(false);

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
  
  // Estado para tipo de logradouro (Rua, Avenida, Travessa, etc.)
  const [streetType, setStreetType] = useState<string>('');
  
  // Estado para loading da busca de CEP
  const [loadingCep, setLoadingCep] = useState(false);
  
  // Ref para debounce do CEP incompleto
  const cepIncompletoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        console.log('🔍 fetchStore:Loja encontrada:', storeData);

        // Preencher formulários com dados da loja
        setStoreName(storeData.name || '');
        setStoreSlug(storeData.slug || '');
        setStoreDescription(storeData.description || '');
        setStoreCategory(storeData.category || 'outros');
        
        // Verificar se info existe antes de acessar
        const address = storeData.info?.address || {};
        
        // Extrai tipo de logradouro do nome da rua se existir
        let extractedStreetType = '';
        let extractedStreetName = address.street || '';
        
        // Verifica se começa com algum tipo conhecido
        const tipos = ['Rua', 'Av', 'Avenida', 'Travessa', 'Trav', 'Alameda', 'Praça', 'Estrada', 'Rodovia'];
        for (const tipo of tipos) {
          if (extractedStreetName.toLowerCase().startsWith(tipo.toLowerCase())) {
            extractedStreetType = tipo;
            extractedStreetName = extractedStreetName.substring(tipo.length).trim();
            break;
          }
        }
        
        setStoreAddress({
          street: extractedStreetName,
          number: address.number || '',
          neighborhood: address.neighborhood || '',
          city: address.city || '',
          state: address.state || '',
          zipCode: address.zipCode ? formatZipCode(address.zipCode) : '',
        });
        
        setStreetType(extractedStreetType);
        
        // Converter workingHours da API (array) para objeto usado no componente
        // Se storeData.info.workingHours for um array, converter
        let workingHoursData: Store['info']['workingHours'];
        
        if (Array.isArray(storeData.info?.workingHours)) {
          // API retornou array, converter para objeto
          workingHoursData = convertApiWorkingHoursToObject(
            storeData.info.workingHours as unknown as ApiWorkingHoursItem[]
          );
        } else if (storeData.info?.workingHours) {
          // Já está no formato objeto
          workingHoursData = storeData.info.workingHours;
        } else {
          // Usar valores padrão
          workingHoursData = {
            monday: { open: '09:00', close: '18:00', closed: false },
            tuesday: { open: '09:00', close: '18:00', closed: false },
            wednesday: { open: '09:00', close: '18:00', closed: false },
            thursday: { open: '09:00', close: '18:00', closed: false },
            friday: { open: '09:00', close: '18:00', closed: false },
            saturday: { open: '09:00', close: '18:00', closed: true },
            sunday: { open: '09:00', close: '18:00', closed: true },
          };
        }
        
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

  // Função para salvar informações básicas
  const handleSaveBasicInfo = async () => {
    if (!storeId) {
      showErrorToast(new Error('Loja não encontrada'), 'Erro');
      return;
    }

    try {
      setLoadingBasicInfo(true);
      const updatedStore = await StoreService.updateStoreBasicInfo(storeId, {
        name: storeName.trim() || undefined,
        slug: storeSlug.trim() || undefined,
        description: storeDescription.trim() || undefined,
        category: storeCategory || undefined,
      });
      
      setStoreName(updatedStore.name || '');
      setStoreSlug(updatedStore.slug || '');
      setStoreDescription(updatedStore.description || '');
      setStoreCategory(updatedStore.category || 'outros');
      
      showSuccessToast('Informações básicas atualizadas com sucesso!', 'Sucesso');
    } catch (error) {
      showErrorToast(error as Error, 'Erro ao salvar informações básicas');
    } finally {
      setLoadingBasicInfo(false);
    }
  };

  // Função para buscar CEP via ViaCEP
  const buscarCep = useCallback(async (cep: string, isManual = false) => {
    const cepLimpo = unformatZipCode(cep);
    
    // Valida formato
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
        showErrorToast('CEP não encontrado. Verifique o CEP digitado.', 'CEP não encontrado');
        return;
      }

      // Preenche os campos automaticamente (exceto número)
      setStoreAddress(prev => ({
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
    // Atualiza o CEP no estado
    setStoreAddress(prev => ({
      ...prev,
      zipCode: cep,
    }));

    // Limpa timeout anterior
    if (cepIncompletoTimeoutRef.current) {
      clearTimeout(cepIncompletoTimeoutRef.current);
      cepIncompletoTimeoutRef.current = null;
    }

    const cepLimpo = unformatZipCode(cep);

    // Se CEP completo (8 dígitos), busca automaticamente
    if (validarFormatoCep(cepLimpo)) {
      buscarCep(cep, false);
    } else if (cepIncompleto(cep)) {
      // Se CEP incompleto, aguarda 5 segundos e notifica
      cepIncompletoTimeoutRef.current = setTimeout(() => {
        showInfoToast('CEP incompleto. Digite os 8 dígitos para buscar automaticamente.', 'CEP incompleto');
      }, 5000);
    }
  }, [buscarCep]);

  // Cleanup do timeout ao desmontar
  useEffect(() => {
    return () => {
      if (cepIncompletoTimeoutRef.current) {
        clearTimeout(cepIncompletoTimeoutRef.current);
      }
    };
  }, []);

  // Função para salvar endereço
  const handleSaveAddress = async () => {
    if (!storeId) {
      showErrorToast(new Error('Loja não encontrada'), 'Erro');
      return;
    }

    try {
      setLoadingAddress(true);
      
      // Concatena tipo de logradouro com nome da rua se tipo foi selecionado
      let streetName = storeAddress.street;
      if (streetType && streetType.trim()) {
        streetName = `${streetType} ${storeAddress.street}`.trim();
      }
      
      const updatedStore = await StoreService.updateStoreAddress(storeId, {
        street: streetName,
        number: storeAddress.number,
        neighborhood: storeAddress.neighborhood,
        city: storeAddress.city,
        state: storeAddress.state,
        zipCode: unformatZipCode(storeAddress.zipCode),
      });
      
      const updatedAddress = updatedStore.info?.address || {};
      
      // Extrai tipo de logradouro do nome da rua se existir
      let extractedStreetType = '';
      let extractedStreetName = updatedAddress.street || '';
      
      // Verifica se começa com algum tipo conhecido
      const tipos = ['Rua', 'Av', 'Avenida', 'Travessa', 'Trav', 'Alameda', 'Praça', 'Estrada', 'Rodovia'];
      for (const tipo of tipos) {
        if (extractedStreetName.toLowerCase().startsWith(tipo.toLowerCase())) {
          extractedStreetType = tipo;
          extractedStreetName = extractedStreetName.substring(tipo.length).trim();
          break;
        }
      }
      
      setStoreAddress({
        street: extractedStreetName,
        number: updatedAddress.number || '',
        neighborhood: updatedAddress.neighborhood || '',
        city: updatedAddress.city || '',
        state: updatedAddress.state || '',
        zipCode: updatedAddress.zipCode ? formatZipCode(updatedAddress.zipCode) : '',
      });
      
      setStreetType(extractedStreetType);
      
      showSuccessToast('Endereço atualizado com sucesso!', 'Sucesso');
    } catch (error) {
      showErrorToast(error as Error, 'Erro ao salvar endereço');
    } finally {
      setLoadingAddress(false);
    }
  };

  // Função para salvar horários de funcionamento
  const handleSaveWorkingHours = async () => {
    if (!storeId) {
      showErrorToast(new Error('Loja não encontrada'), 'Erro');
      return;
    }

    try {
      setLoadingWorkingHours(true);
      const apiWorkingHours = convertObjectToApiWorkingHours(workingHours);
      const updatedStore = await StoreService.updateStoreWorkingHours(storeId, apiWorkingHours);
      
      // Converter workingHours retornado pela API para o formato usado no componente
      let updatedWorkingHours: Store['info']['workingHours'];
      
      if (Array.isArray(updatedStore.info?.workingHours)) {
        updatedWorkingHours = convertApiWorkingHoursToObject(
          updatedStore.info.workingHours as unknown as ApiWorkingHoursItem[]
        );
      } else if (updatedStore.info?.workingHours) {
        updatedWorkingHours = updatedStore.info.workingHours;
      } else {
        updatedWorkingHours = workingHours;
      }
      
      setWorkingHours(updatedWorkingHours);
      
      showSuccessToast('Horários de funcionamento atualizados com sucesso!', 'Sucesso');
    } catch (error) {
      showErrorToast(error as Error, 'Erro ao salvar horários de funcionamento');
    } finally {
      setLoadingWorkingHours(false);
    }
  };

  // Função para salvar configurações de entrega
  const handleSaveDeliverySettings = async () => {
    if (!storeId) {
      showErrorToast(new Error('Loja não encontrada'), 'Erro');
      return;
    }

    try {
      setLoadingDeliverySettings(true);
      const updatedStore = await StoreService.updateStoreDeliverySettings(storeId, {
        isActive,
        deliveryTime: deliveryTime || undefined,
        minOrderValue,
        deliveryFee,
        freeDeliveryAbove,
      });
      
      const updatedSettings = updatedStore.settings || {};
      setIsActive(updatedSettings.isActive || false);
      setDeliveryTime(updatedSettings.deliveryTime || '');
      setMinOrderValue(updatedSettings.minOrderValue || 0);
      setDeliveryFee(updatedSettings.deliveryFee || 0);
      setFreeDeliveryAbove(updatedSettings.freeDeliveryAbove || 0);
      
      showSuccessToast('Configurações de entrega atualizadas com sucesso!', 'Sucesso');
    } catch (error) {
      showErrorToast(error as Error, 'Erro ao salvar configurações de entrega');
    } finally {
      setLoadingDeliverySettings(false);
    }
  };

  // Função para salvar métodos de pagamento
  const handleSavePaymentMethods = async () => {
    if (!storeId) {
      showErrorToast(new Error('Loja não encontrada'), 'Erro');
      return;
    }

    try {
      setLoadingPaymentMethods(true);
      const updatedStore = await StoreService.updateStorePaymentMethods(storeId, acceptsPayment);
      
      const updatedSettings = updatedStore.settings || {};
      setAcceptsPayment(updatedSettings.acceptsPayment || acceptsPayment);
      
      showSuccessToast('Métodos de pagamento atualizados com sucesso!', 'Sucesso');
    } catch (error) {
      showErrorToast(error as Error, 'Erro ao salvar métodos de pagamento');
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  // Função para salvar tema
  const handleSaveTheme = async () => {
    if (!storeId) {
      showErrorToast(new Error('Loja não encontrada'), 'Erro');
      return;
    }

    try {
      setLoadingTheme(true);
      const updatedStore = await StoreService.updateStoreTheme(storeId, theme);
      
      const updatedTheme = updatedStore.theme || {};
      setTheme({
        primaryColor: updatedTheme.primaryColor || '#DC2626',
        secondaryColor: updatedTheme.secondaryColor || '#2563EB',
        accentColor: updatedTheme.accentColor || '#059669',
        textColor: updatedTheme.textColor || '#FFFFFF',
      });
      
      showSuccessToast('Tema atualizado com sucesso!', 'Sucesso');
    } catch (error) {
      showErrorToast(error as Error, 'Erro ao salvar tema');
    } finally {
      setLoadingTheme(false);
    }
  };

  const handleWorkingHoursChange = (
    day: keyof typeof workingHours,
    field: 'open' | 'close' | 'closed',
    value: string | boolean
  ) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
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
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            Configurações da Loja
          </h1>
          <p className="text-gray-600 mt-2">Gerencie as informações e configurações da sua loja</p>
        </div>

        {/* Accordion com todas as seções */}
        <Accordion type="multiple" defaultValue={['basic-info']}>
          {/* Informações Básicas */}
          <AccordionItem value="basic-info">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <h2 className="text-xl font-semibold">Informações Básicas</h2>
                  <p className="text-sm text-gray-600 mt-1">Dados principais da sua loja</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Nome da Loja <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Minha Loja"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Slug da Loja (URL) <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="minha-loja"
                  value={storeSlug}
                  onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  required
                />
                <p className="text-xs text-gray-500">
                  URL da sua loja: {window.location.origin}/loja/{storeSlug || 'sua-loja'}
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Descrição
                </label>
                <Textarea
                  placeholder="Descreva sua loja..."
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Categoria
                </label>
                <select
                  value={storeCategory}
                  onChange={(e) => setStoreCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {STORE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={handleSaveBasicInfo}
                    loading={loadingBasicInfo}
                    disabled={loadingBasicInfo}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Informações Básicas
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Endereço da Loja */}
          <AccordionItem value="address">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <h2 className="text-xl font-semibold">Endereço da Loja</h2>
                  <p className="text-sm text-gray-600 mt-1">Endereço físico da sua loja</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {/* CEP - Primeiro campo */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    CEP <span className="text-destructive">*</span>
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="00000-000"
                      value={formatZipCode(storeAddress.zipCode)}
                      onChange={(e) => handleCepChange(e.target.value)}
                      maxLength={9}
                      className="flex-1"
                      disabled={loadingCep}
                    />
                    <Button
                      type="button"
                      onClick={() => buscarCep(storeAddress.zipCode, true)}
                      loading={loadingCep}
                      disabled={loadingCep || !storeAddress.zipCode}
                      variant="outline"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Digite o CEP e o endereço será preenchido automaticamente
                  </p>
                </div>

                {/* Tipo de Logradouro */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Tipo de Logradouro
                  </label>
                  <select
                    value={streetType}
                    onChange={(e) => setStreetType(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="Rua">Rua</option>
                    <option value="Avenida">Avenida</option>
                    <option value="Av">Av</option>
                    <option value="Travessa">Travessa</option>
                    <option value="Trav">Trav</option>
                    <option value="Alameda">Alameda</option>
                    <option value="Praça">Praça</option>
                    <option value="Estrada">Estrada</option>
                    <option value="Rodovia">Rodovia</option>
                  </select>
                  <p className="text-xs text-gray-500">
                    O tipo será adicionado automaticamente ao nome da rua ao salvar
                  </p>
                </div>

                {/* Resto do formulário de endereço */}
                <AddressForm
                  value={storeAddress}
                  onChange={setStoreAddress}
                  showOptionalFields={false}
                  hideZipCode={true}
                />
              </div>
              
              <div className="flex justify-end pt-4 border-t mt-4">
                <Button
                  onClick={handleSaveAddress}
                  loading={loadingAddress}
                  disabled={loadingAddress}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Endereço
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Horários de Funcionamento */}
          <AccordionItem value="working-hours">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <h2 className="text-xl font-semibold">Horários de Funcionamento</h2>
                  <p className="text-sm text-gray-600 mt-1">Defina os horários de funcionamento da loja</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
            <div className="space-y-4">
              {DAYS_OF_WEEK.map((day) => {
                const dayHours = workingHours[day.key] || { 
                  open: '09:00', 
                  close: '18:00', 
                  closed: false 
                };
                return (
                  <div key={day.key} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex items-center gap-2 min-w-[140px]">
                      <input
                        type="checkbox"
                        checked={!dayHours.closed}
                        onChange={(e) => handleWorkingHoursChange(day.key, 'closed', !e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label className="text-sm font-medium text-foreground min-w-[120px]">
                        {day.label}
                      </label>
                    </div>
                    {!dayHours.closed && (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="time"
                          value={dayHours.open}
                          onChange={(e) => handleWorkingHoursChange(day.key, 'open', e.target.value)}
                          className="w-32"
                        />
                        <span className="text-gray-500">até</span>
                        <Input
                          type="time"
                          value={dayHours.close}
                          onChange={(e) => handleWorkingHoursChange(day.key, 'close', e.target.value)}
                          className="w-32"
                        />
                      </div>
                    )}
                    {dayHours.closed && (
                      <span className="text-sm text-gray-500">Fechado</span>
                    )}
                  </div>
                );
              })}
              </div>
              <div className="flex justify-end pt-4 border-t mt-4">
                <Button
                  onClick={handleSaveWorkingHours}
                  loading={loadingWorkingHours}
                  disabled={loadingWorkingHours}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Horários
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Configurações de Entrega */}
          <AccordionItem value="delivery-settings">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <h2 className="text-xl font-semibold">Configurações de Entrega</h2>
                  <p className="text-sm text-gray-600 mt-1">Configure valores e prazos de entrega</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <label className="text-sm font-medium text-foreground">Loja Ativa</label>
                <p className="text-xs text-gray-500">A loja aparecerá para os clientes</p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Tempo de Entrega
                </label>
                <Input
                  placeholder="30-45 min"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Valor Mínimo do Pedido (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Taxa de Entrega (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Entrega Grátis Acima de (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={freeDeliveryAbove}
                  onChange={(e) => setFreeDeliveryAbove(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={handleSaveDeliverySettings}
                  loading={loadingDeliverySettings}
                  disabled={loadingDeliverySettings}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações de Entrega
                </Button>
              </div>
            </div>
            </AccordionContent>
          </AccordionItem>

          {/* Métodos de Pagamento */}
          <AccordionItem value="payment-methods">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <h2 className="text-xl font-semibold">Métodos de Pagamento</h2>
                  <p className="text-sm text-gray-600 mt-1">Selecione os métodos de pagamento aceitos</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
            <div className="space-y-3">
              {[
                { key: 'creditCard', label: 'Cartão de Crédito' },
                { key: 'debitCard', label: 'Cartão de Débito' },
                { key: 'pix', label: 'PIX' },
                { key: 'cash', label: 'Dinheiro' },
              ].map((method) => (
                <div key={method.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <label className="text-sm font-medium text-foreground">{method.label}</label>
                  <Switch
                    checked={acceptsPayment[method.key as keyof typeof acceptsPayment]}
                    onCheckedChange={(checked) =>
                      setAcceptsPayment(prev => ({
                        ...prev,
                        [method.key]: checked,
                      }))
                    }
                  />
                </div>
              ))}
              </div>
              <div className="flex justify-end pt-4 border-t mt-4">
                <Button
                  onClick={handleSavePaymentMethods}
                  loading={loadingPaymentMethods}
                  disabled={loadingPaymentMethods}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Métodos de Pagamento
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Tema e Cores */}
          <AccordionItem 
            value="theme" 
            disabled={true}
            onDisabledClick={() => {
              showInfoToast('A funcionalidade de personalização de tema ainda não está disponível. Em breve você poderá personalizar as cores da sua loja!', 'Funcionalidade em desenvolvimento');
            }}
          >
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <h2 className="text-xl font-semibold">Tema e Cores</h2>
                  <p className="text-sm text-gray-600 mt-1">Personalize as cores da sua loja</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Cor Primária
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={theme.primaryColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                    placeholder="#DC2626"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Cor Secundária
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={theme.secondaryColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={theme.secondaryColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    placeholder="#2563EB"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Cor de Destaque
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={theme.accentColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, accentColor: e.target.value }))}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={theme.accentColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, accentColor: e.target.value }))}
                    placeholder="#059669"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Cor do Texto
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={theme.textColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, textColor: e.target.value }))}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={theme.textColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, textColor: e.target.value }))}
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>
            </div>
              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={handleSaveTheme}
                  loading={loadingTheme}
                  disabled={loadingTheme}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Tema
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </MerchantLayout>
  );
};

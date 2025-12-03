/**
 * Página de configurações da loja (merchant)
 * Permite editar informações da loja, endereço, horários, configurações e tema
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Settings, Building2, MapPin, Clock, DollarSign, Palette, CreditCard, Save, Loader2 } from 'lucide-react';
import { MerchantLayout } from '@/components/layout/MerchantLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/cards';
import { Button } from '@/components/ui/buttons';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/forms/Textarea';
import { Switch } from '@/components/ui/switch/Switch';
import { useMerchantAuth } from '@/hooks/useMerchantAuth';
import { StoreService, type UpdateStorePayload } from '@/services/stores/storeService';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { unformatZipCode } from '@/utils/format';
import { AddressForm, type AddressFormData } from '@/components/forms/AddressForm';
import type { Store } from '@/types/store';

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

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
] as const;

export const MerchantSettings: React.FC = () => {
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
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 shadow-2xl max-w-sm w-full mx-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Salvando configurações...
            </h3>
            <p className="text-sm text-gray-600">
              Por favor, aguarde enquanto suas alterações são salvas.
            </p>
          </div>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            Configurações da Loja
          </h1>
          <p className="text-gray-600 mt-2">Gerencie as informações e configurações da sua loja</p>
        </div>

        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Informações Básicas</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Dados principais da sua loja</p>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  URL da sua loja: {window.location.origin}/store/{storeSlug || 'sua-loja'}
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
          </CardContent>
        </Card>

        {/* Endereço da Loja */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Endereço da Loja</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Endereço físico da sua loja</p>
          </CardHeader>
          <CardContent>
            <AddressForm
              value={storeAddress}
              onChange={setStoreAddress}
              showOptionalFields={false}
            />
          </CardContent>
        </Card>

        {/* Horários de Funcionamento */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Horários de Funcionamento</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Defina os horários de funcionamento da loja</p>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Configurações de Entrega */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Configurações de Entrega</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Configure valores e prazos de entrega</p>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Métodos de Pagamento */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Métodos de Pagamento</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Selecione os métodos de pagamento aceitos</p>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Tema e Cores */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Tema e Cores</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Personalize as cores da sua loja</p>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

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

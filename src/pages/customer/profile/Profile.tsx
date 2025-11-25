import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoreLayout } from '@/components/layout';
import { Badge, Button, Collapsible, Input, Switch, Skeleton } from '@/components/ui';
import { InputWithLabel } from '@/components/ui/forms';
import { useAuthContext, useStoreContext } from '@/contexts';
import { OrderService } from '@/services/orderService';
import { formatPrice, formatAddress, getLocalISOString, formatDateTime, cn } from '@/utils';
import { MapPin, Home, Briefcase, Package, Clock, CheckCircle, XCircle, Loader, Edit2, Save, X, ArrowLeft, Lock } from 'lucide-react';
import type { Order, Customer, DeliveryAddress } from '@/types';

const getStatusBadge = (status: Order['status']) => {
  const statusConfig = {
    pending: { label: 'Pendente', variant: 'default' as const, icon: Clock },
    confirmed: { label: 'Confirmado', variant: 'default' as const, icon: CheckCircle },
    preparing: { label: 'Preparando', variant: 'default' as const, icon: Loader },
    ready: { label: 'Pronto', variant: 'default' as const, icon: CheckCircle },
    out_for_delivery: { label: 'Saiu para entrega', variant: 'default' as const, icon: Package },
    delivered: { label: 'Entregue', variant: 'default' as const, icon: CheckCircle },
    cancelled: { label: 'Cancelado', variant: 'destructive' as const, icon: XCircle },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};



export const Profile: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { user, isCustomer, loading, updateUser, login } = useAuthContext();
  const { currentStore } = useStoreContext();
  
  // Estados para edição de informações pessoais
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');

  // Estados para edição de endereços
  const [editingAddress, setEditingAddress] = useState<'home' | 'work' | null>(null);
  const [editedAddress, setEditedAddress] = useState<Partial<DeliveryAddress & { isDefault: boolean }>>({});

  // Estados para pedidos
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Estados para login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Type guard: verificar se user é Customer
  const customer = user && isCustomer ? (user as Customer) : null;
  
  // Estado para verificar token (evitar hidratação mismatch)
  const [hasToken, setHasToken] = useState(false);
  
  // Verificar token apenas no cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasToken(!!localStorage.getItem('store-flow-token'));
    }
  }, []);
  
  // Verificar se não está autenticado
  const isNotAuthenticated = !loading && (!user || !isCustomer || !customer || !hasToken);

  // Buscar pedidos do cliente
  useEffect(() => {
    if (!customer?.id) return;

    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        setOrdersError(null);
        const customerOrders = await OrderService.getCustomerOrders(customer.id);
        setOrders(customerOrders);
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        setOrdersError('Erro ao carregar pedidos');
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [customer?.id]);

  // Aguardar carregamento do contexto de autenticação
  if (loading) {
    return (
      <StoreLayout showSearch={false}>
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Header Skeleton */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-20 shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>

          {/* Informações Pessoais Skeleton */}
          <Collapsible title="Informações Pessoais" defaultOpen={true}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-full" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </Collapsible>

          {/* Endereços Skeleton */}
          <Collapsible title="Endereços">
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          </Collapsible>

          {/* Pedidos Skeleton */}
          <Collapsible title="Pedidos">
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </Collapsible>
        </div>
      </StoreLayout>
    );
  }

  // Handler para login
  const handleLogin = async () => {
    // Validar email e senha
    if (!loginEmail.trim() || !loginPassword.trim()) {
      return;
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginEmail)) {
      return;
    }

    // Validar senha (mínimo 6 caracteres)
    if (loginPassword.length < 6) {
      return;
    }

    // Validar storeId
    if (!storeId) {
      console.error('storeId não encontrado na URL');
      return;
    }

    setLoginLoading(true);
    try {
      await login({ 
        email: loginEmail.trim(), 
        password: loginPassword,
        storeId 
      });
      // Após login bem-sucedido, redirecionar para página principal da loja
      if (storeId) {
        navigate(`/loja/${storeId}`);
      }
      // Limpar campos
      setLoginEmail('');
      setLoginPassword('');
    } catch (error) {
      console.error('Erro no login:', error);
    } finally {
      setLoginLoading(false);
    }
  };
  
  // Inicializar valores de edição quando entrar no modo de edição
  const handleStartEdit = () => {
    if (!customer) return;
    setEditedName(customer.name);
    setEditedPhone(customer.phone);
    setIsEditingPersonalInfo(true);
  };

  const handleCancelEdit = () => {
    setIsEditingPersonalInfo(false);
    setEditedName('');
    setEditedPhone('');
  };

  const handleSavePersonalInfo = () => {
    if (!customer) return;
    // Atualizar o usuário no contexto e localStorage
    const updatedCustomer: Customer = {
      ...customer,
      name: editedName.trim(),
      phone: editedPhone.trim(),
      updatedAt: getLocalISOString(),
    };
    
    // Atualizar através do contexto
    updateUser(updatedCustomer);
    
    // Sair do modo de edição
    setIsEditingPersonalInfo(false);
  };

  // Funções para edição de endereços
  const handleStartEditAddress = (type: 'home' | 'work') => {
    if (!customer) return;
    const address = type === 'home' ? customer.addresses?.home : customer.addresses?.work;
    setEditingAddress(type);
    setEditedAddress({
      street: address?.street || '',
      number: address?.number || '',
      neighborhood: address?.neighborhood || '',
      city: address?.city || '',
      state: address?.state || '',
      zipCode: address?.zipCode || '',
      complement: address?.complement || '',
      reference: address?.reference || '',
      isDefault: address?.isDefault || false,
    });
    
  };

  const handleCancelEditAddress = () => {
    setEditingAddress(null);
    setEditedAddress({});
  };

  const handleSaveAddress = (type: 'home' | 'work') => {
    if (!customer) return;
    // Validar campos obrigatórios
    if (!editedAddress.street || !editedAddress.number || !editedAddress.neighborhood || 
        !editedAddress.city || !editedAddress.state || !editedAddress.zipCode) {
      return; // TODO: Mostrar mensagem de erro
    }

    const updatedCustomer: Customer = {
      ...customer,
      addresses: {
        ...customer.addresses,
        [type]: {
          street: editedAddress.street!,
          number: editedAddress.number!,
          neighborhood: editedAddress.neighborhood!,
          city: editedAddress.city!,
          state: editedAddress.state!,
          zipCode: editedAddress.zipCode!,
          complement: editedAddress.complement || '',
          reference: editedAddress.reference || '',
          isDefault: editedAddress.isDefault || false,
          updatedAt: getLocalISOString(),
        },
        // Se este endereço foi marcado como padrão, remover padrão do outro
        ...(editedAddress.isDefault && {
          [type === 'home' ? 'work' : 'home']: customer.addresses?.[type === 'home' ? 'work' : 'home'] 
            ? { ...customer.addresses[type === 'home' ? 'work' : 'home']!, isDefault: false }
            : undefined,
        }),
      },
      updatedAt: new Date().toISOString(),
    };

    // Se nenhum endereço foi marcado como padrão, marcar este como padrão
    if (!editedAddress.isDefault && 
        !customer.addresses?.home?.isDefault && 
        !customer.addresses?.work?.isDefault) {
      updatedCustomer.addresses![type]!.isDefault = true;
    }

    updatedCustomer.updatedAt = getLocalISOString();
    updateUser(updatedCustomer);
    console.log("updatedCustomer", updatedCustomer);
    setEditingAddress(null);
    setEditedAddress({});
  };

  const handleSetDefaultAddress = (type: 'home' | 'work') => {
    if (!customer) return;
    const updatedCustomer: Customer = {
      ...customer,
      addresses: {
        ...customer.addresses,
        [type]: customer.addresses?.[type] 
          ? { ...customer.addresses[type]!, isDefault: true, updatedAt: getLocalISOString() }
          : undefined,
        // Remover padrão do outro endereço
        [type === 'home' ? 'work' : 'home']: customer.addresses?.[type === 'home' ? 'work' : 'home']
          ? { ...customer.addresses[type === 'home' ? 'work' : 'home']!, isDefault: false }
          : undefined,
      },
      updatedAt: getLocalISOString(),
    };

    updateUser(updatedCustomer);
  };

  // Filtrar pedidos desta loja
  const storeOrders = storeId 
    ? orders.filter(order => order.storeId === storeId)
    : orders;

  // Conteúdo do perfil (pode estar desfocado se não autenticado)
  const profileContent = (
    <StoreLayout showSearch={false}>
      <div className={cn(
        "max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6",
        isNotAuthenticated && "blur-sm pointer-events-none select-none"
      )}>
        {/* Header do Perfil */}
        <div className="space-y-2">
          {/* Linha superior: Botão Voltar e Título */}
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.history.back()}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-primary">
                Meu Perfil
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Gerencie suas informações e acompanhe seus pedidos
              </p>
            </div>
          </div>
        </div>

        {/* Informações Pessoais */}
        <Collapsible title="Informações Pessoais" defaultOpen={true}>
          {!isEditingPersonalInfo ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome</label>
                <p className="text-base font-medium mt-1">{customer?.name || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                <p className="text-base font-medium mt-1">{customer?.phone || '-'}</p>
              </div>
              <Button
                variant="outline"
                onClick={handleStartEdit}
                className="w-full sm:w-auto"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Editar Informações
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Nome
                </label>
                <Input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Digite seu nome"
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Telefone
                </label>
                <Input
                  type="tel"
                  value={editedPhone}
                  onChange={(e) => setEditedPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSavePersonalInfo}
                  className="flex-1"
                  disabled={!editedName.trim() || !editedPhone.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </Collapsible>

        {/* Endereços */}
        <Collapsible title="Endereços">
          <div className="space-y-3">
            {/* Endereço Casa */}
            <div 
              className={cn(
                "border rounded-lg p-3 sm:p-4 transition-all cursor-pointer",
                editingAddress === 'home' 
                  ? "ring-2 ring-primary" 
                  : "hover:border-primary/50 hover:shadow-sm",
                !customer?.addresses?.home && "border-dashed"
              )}
              onClick={() => !editingAddress && customer?.addresses?.home && handleStartEditAddress('home')}
            >
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Home className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                  <span className="font-semibold text-sm sm:text-base truncate">Casa</span>
                  {customer?.addresses?.home?.isDefault && (
                    <Badge variant="default" className="ml-1 text-xs shrink-0">Padrão</Badge>
                  )}
                </div>
                {customer?.addresses?.home && !editingAddress && (
                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs text-muted-foreground hidden sm:inline">Padrão</span>
                    <Switch
                      checked={customer?.addresses?.home?.isDefault || false}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleSetDefaultAddress('home');
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              {editingAddress === 'home' ? (
                <div className="space-y-3 sm:space-y-4 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <InputWithLabel
                      label="Rua"
                      value={editedAddress.street || ''}
                      onChange={(e) => setEditedAddress({ ...editedAddress, street: e.target.value })}
                      placeholder="Nome da rua"
                      required
                    />
                    <InputWithLabel
                      label="Número"
                      value={editedAddress.number || ''}
                      onChange={(e) => setEditedAddress({ ...editedAddress, number: e.target.value })}
                      placeholder="123"
                      required
                    />
                    <InputWithLabel
                      label="Bairro"
                      value={editedAddress.neighborhood || ''}
                      onChange={(e) => setEditedAddress({ ...editedAddress, neighborhood: e.target.value })}
                      placeholder="Nome do bairro"
                      required
                    />
                    <InputWithLabel
                      label="CEP"
                      value={editedAddress.zipCode || ''}
                      onChange={(e) => setEditedAddress({ ...editedAddress, zipCode: e.target.value })}
                      placeholder="00000-000"
                      required
                    />
                    <InputWithLabel
                      label="Cidade"
                      value={editedAddress.city || ''}
                      onChange={(e) => setEditedAddress({ ...editedAddress, city: e.target.value })}
                      placeholder="Nome da cidade"
                      required
                    />
                    <InputWithLabel
                      label="Estado"
                      value={editedAddress.state || ''}
                      onChange={(e) => setEditedAddress({ ...editedAddress, state: e.target.value.toUpperCase() })}
                      placeholder="SP"
                      maxLength={2}
                      required
                    />
                    <InputWithLabel
                      label="Complemento"
                      value={editedAddress.complement || ''}
                      onChange={(e) => setEditedAddress({ ...editedAddress, complement: e.target.value })}
                      placeholder="Apto, Bloco, etc."
                    />
                    <InputWithLabel
                      label="Referência"
                      value={editedAddress.reference || ''}
                      onChange={(e) => setEditedAddress({ ...editedAddress, reference: e.target.value })}
                      placeholder="Ponto de referência"
                      className="sm:col-span-2"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <label htmlFor="home-default" className="text-sm font-medium text-muted-foreground">
                      Definir como endereço padrão
                    </label>
                    <Switch
                      id="home-default"
                      checked={editedAddress.isDefault || false}
                      onCheckedChange={(checked) => setEditedAddress({ ...editedAddress, isDefault: checked })}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button
                      onClick={() => handleSaveAddress('home')}
                      className="flex-1"
                      size="sm"
                      disabled={!editedAddress.street || !editedAddress.number || 
                               !editedAddress.neighborhood || !editedAddress.city || !editedAddress.state || !editedAddress.zipCode}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelEditAddress}
                      className="flex-1"
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : customer?.addresses?.home ? (
                <div className="pl-6 sm:pl-7 space-y-1 pt-2">
                  <p className="text-sm break-words">{formatAddress(customer.addresses.home)}</p>
                  {customer.addresses.home.reference && (
                    <p className="text-xs text-muted-foreground break-words">
                      Referência: {customer.addresses.home.reference}
                    </p>
                  )}
                  {customer.addresses.home.updatedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Última atualização: {formatDateTime(customer.addresses.home.updatedAt)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="pl-6 sm:pl-7 pt-2">
                  <p className="text-sm text-muted-foreground mb-2">Nenhum endereço cadastrado</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEditAddress('home');
                    }}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Adicionar Endereço
                  </Button>
                </div>
              )}
            </div>

            {/* Endereço Trabalho */}
            <div 
              className={cn(
                "border rounded-lg p-3 sm:p-4 transition-all cursor-pointer",
                editingAddress === 'work' 
                  ? "ring-2 ring-primary" 
                  : "hover:border-primary/50 hover:shadow-sm",
                !customer?.addresses?.work && "border-dashed"
              )}
              onClick={() => !editingAddress && customer?.addresses?.work && handleStartEditAddress('work')}
            >
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                  <span className="font-semibold text-sm sm:text-base truncate">Trabalho</span>
                  {customer?.addresses?.work?.isDefault && (
                    <Badge variant="default" className="ml-1 text-xs shrink-0">Padrão</Badge>
                  )}
                </div>
                {customer?.addresses?.work && !editingAddress && (
                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs text-muted-foreground hidden sm:inline">Padrão</span>
                    <Switch
                      checked={customer?.addresses?.work?.isDefault || false}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleSetDefaultAddress('work');
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              {editingAddress === 'work' ? (
                <div className="space-y-3 sm:space-y-4 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <InputWithLabel
                      label="Rua"
                      value={editedAddress.street || ''}
                      onChange={(e) => setEditedAddress({ ...editedAddress, street: e.target.value })}
                      placeholder="Nome da rua"
                      required
                    />
                    <InputWithLabel
                      label="Número"
                      value={editedAddress.number || ''}
                      onChange={(e) => setEditedAddress({ ...editedAddress, number: e.target.value })}
                      placeholder="123"
                      required
                    />
                    <InputWithLabel
                      label="Bairro"
                      value={editedAddress.neighborhood || ''}
                      onChange={(e) => setEditedAddress({ ...editedAddress, neighborhood: e.target.value })}
                      placeholder="Nome do bairro"
                      required
                    />
                    <InputWithLabel
                      label="CEP"
                      value={editedAddress.zipCode || ''}
                      onChange={(e) => setEditedAddress({ ...editedAddress, zipCode: e.target.value })}
                      placeholder="00000-000"
                      required
                    />
                    <InputWithLabel
                      label="Cidade"
                      value={editedAddress.city || ''}
                      onChange={(e) => setEditedAddress({ ...editedAddress, city: e.target.value })}
                      placeholder="Nome da cidade"
                      required
                    />
                    <InputWithLabel
                      label="Estado"
                      value={editedAddress.state || ''}
                      onChange={(e) => setEditedAddress({ ...editedAddress, state: e.target.value.toUpperCase() })}
                      placeholder="SP"
                      maxLength={2}
                      required
                    />
                    <InputWithLabel
                      label="Complemento"
                      value={editedAddress.complement || ''}
                      onChange={(e) => setEditedAddress({ ...editedAddress, complement: e.target.value })}
                      placeholder="Apto, Bloco, etc."
                    />
                    <InputWithLabel
                      label="Referência"
                      value={editedAddress.reference || ''}
                      onChange={(e) => setEditedAddress({ ...editedAddress, reference: e.target.value })}
                      placeholder="Ponto de referência"
                      className="sm:col-span-2"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <label htmlFor="work-default" className="text-sm font-medium text-muted-foreground">
                      Definir como endereço padrão
                    </label>
                    <Switch
                      id="work-default"
                      checked={editedAddress.isDefault || false}
                      onCheckedChange={(checked) => setEditedAddress({ ...editedAddress, isDefault: checked })}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button
                      onClick={() => handleSaveAddress('work')}
                      className="flex-1"
                      size="sm"
                      disabled={!editedAddress.street || !editedAddress.number || 
                               !editedAddress.neighborhood || !editedAddress.city || !editedAddress.state || !editedAddress.zipCode}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelEditAddress}
                      className="flex-1"
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : customer?.addresses?.work ? (
                <div className="pl-6 sm:pl-7 space-y-1 pt-2">
                  <p className="text-sm break-words">{formatAddress(customer.addresses.work)}</p>
                  {customer.addresses.work.reference && (
                    <p className="text-xs text-muted-foreground break-words">
                      Referência: {customer.addresses.work.reference}
                    </p>
                  )}
                  {customer.addresses.work.updatedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Última atualização: {formatDateTime(customer.addresses.work.updatedAt)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="pl-6 sm:pl-7 pt-2">
                  <p className="text-sm text-muted-foreground mb-2">Nenhum endereço cadastrado</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEditAddress('work');
                    }}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Adicionar Endereço
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Collapsible>

        {/* Histórico de Pedidos */}
        <Collapsible title={`Pedidos ${currentStore ? `na ${currentStore.name}` : ''}`}>
          {ordersLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <div className="space-y-2 pt-4 border-t">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <div className="space-y-2 pt-4 border-t">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                </div>
              ))}
            </div>
          ) : ordersError ? (
            <div className="text-center py-12 space-y-2">
              <Package className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">{ordersError}</p>
            </div>
          ) : storeOrders.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Package className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Você ainda não fez pedidos nesta loja</p>
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="mt-4"
              >
                Ver Cardápio
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {storeOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 space-y-4">
                  {/* Header do Pedido */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="font-semibold">Pedido #{order.id.split('-')[1]}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  {/* Itens do Pedido */}
                  <div className="space-y-2 pt-4 border-t">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity}x {formatPrice(item.product.price)}
                          </p>
                        </div>
                        <p className="font-medium">{formatPrice(item.totalPrice)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Total e Endereço */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(order.totalAmount - order.deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Taxa de entrega</span>
                      <span>{formatPrice(order.deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(order.totalAmount)}</span>
                    </div>
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {formatAddress(order.deliveryAddress)}
                      </p>
                    </div>
                  </div>

                  {/* Status de Pagamento */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Pagamento</span>
                      <Badge 
                        variant={order.paymentStatus === 'paid' ? 'default' : 'destructive'}
                      >
                        {order.paymentStatus === 'paid' ? 'Pago' : 'Pendente'} • {
                          order.paymentMethod === 'credit_card' ? 'Cartão de Crédito' :
                          order.paymentMethod === 'debit_card' ? 'Cartão de Débito' :
                          order.paymentMethod === 'pix' ? 'PIX' :
                          'Dinheiro'
                        }
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Collapsible>
      </div>
    </StoreLayout>
  );

  // Se não estiver autenticado, mostrar overlay de login
  if (isNotAuthenticated) {
    return (
      <>
        {profileContent}
        {/* Overlay de Login */}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-md p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold">Acesso ao Perfil</h2>
              <p className="text-muted-foreground text-sm">
                Faça login para acessar seu perfil e acompanhar seus pedidos
              </p>
            </div>

            <div className="space-y-4">
              <InputWithLabel
                label="Email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="seu@email.com"
                disabled={loginLoading}
                className="w-full"
                autoFocus
                autoComplete="email"
              />

              <InputWithLabel
                label="Senha"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Digite sua senha"
                disabled={loginLoading}
                className="w-full"
                autoComplete="current-password"
              />

              <Button
                onClick={handleLogin}
                disabled={!loginEmail.trim() || !loginPassword.trim() || loginLoading || loading || !storeId}
                loading={loginLoading}
                className="w-full"
                size="lg"
              >
                {loginLoading ? 'Entrando...' : 'Entrar'}
              </Button>

              <Button
                variant="outline"
                onClick={() => window.history.back()}
                disabled={loginLoading}
                className="w-full"
              >
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Se estiver autenticado, mostrar conteúdo normal
  return profileContent;
};

/**
 * Página de perfil do customer
 * Componente apenas com responsabilidade de UI
 * Lógica de negócio separada no hook useProfile
 */

import React from 'react';
import { StoreLayout } from '@/components/layout';
import { Badge, Button, Collapsible, Input, Switch } from '@/components/ui';
import { InputWithLabel } from '@/components/ui/forms';
import { formatAddress, formatDateTime, cn, formatZipCode } from '@/utils';
import { MapPin, Home, Briefcase, Edit2, Save, X, Search, LogOut } from 'lucide-react';
import { LoadingProfile } from "../../../components/business/skeletons";
import { useProfile } from './hooks/useProfile';

export const Profile: React.FC = () => {
  const {
    customer,
    loading,
    isEditingPersonalInfo,
    editedName,
    setEditedName,
    editedPhone,
    setEditedPhone,
    editingAddress,
    editedAddress,
    setEditedAddress,
    streetType,
    setStreetType,
    loadingCep,
    handleStartEdit,
    handleCancelEdit,
    handleSavePersonalInfo,
    handleStartEditAddress,
    handleCancelEditAddress,
    handleSaveAddress,
    handleSetDefaultAddress,
    handleCepChange,
    buscarCep,
    handleLogout,
  } = useProfile();

  // Aguardar carregamento
  if (loading) {
    return <LoadingProfile />;
  }

  // Se não estiver autenticado, não renderizar nada (será redirecionado pelo hook)
  if (!customer) {
    return <LoadingProfile />;
  }

  return (
    <StoreLayout>
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header do Perfil */}
        <div className="space-y-2">
          {/* Linha superior: Descrição e Botão Logout */}
          <div className="flex items-center justify-between gap-3 mt-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Gerencie suas informações
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="shrink-0"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Informações Pessoais */}
        <Collapsible title="Informações Pessoais" >
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
                  {/* CEP - Primeiro campo */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      CEP <span className="text-destructive">*</span>
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="00000-000"
                        value={formatZipCode(editedAddress.zipCode || '')}
                        onChange={(e) => handleCepChange(e.target.value)}
                        maxLength={9}
                        className="flex-1"
                        disabled={loadingCep}
                      />
                      <Button
                        type="button"
                        onClick={() => buscarCep(editedAddress.zipCode || '', true)}
                        loading={loadingCep}
                        disabled={loadingCep || !editedAddress.zipCode}
                        variant="outline"
                        size="sm"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Buscar
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
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
                    <p className="text-xs text-muted-foreground">
                      O tipo será adicionado automaticamente ao nome da rua ao salvar
                    </p>
                  </div>

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
                  {/* CEP - Primeiro campo */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      CEP <span className="text-destructive">*</span>
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="00000-000"
                        value={formatZipCode(editedAddress.zipCode || '')}
                        onChange={(e) => handleCepChange(e.target.value)}
                        maxLength={9}
                        className="flex-1"
                        disabled={loadingCep}
                      />
                      <Button
                        type="button"
                        onClick={() => buscarCep(editedAddress.zipCode || '', true)}
                        loading={loadingCep}
                        disabled={loadingCep || !editedAddress.zipCode}
                        variant="outline"
                        size="sm"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Buscar
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
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
                    <p className="text-xs text-muted-foreground">
                      O tipo será adicionado automaticamente ao nome da rua ao salvar
                    </p>
                  </div>

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
        <Collapsible title={`Extrato de pedido`}>
          <div className='space-y-3 gap-2 '>
            <Button
              variant={'destructive'}
              className='w-full bg-slate-50 shadow-xl  text-black'
              color='black'
              onClick={() => {
                window.location.href = `/loja/${customer.storeId}/orders`;
              }}
            >
              Pedido Confirmado
            </Button>
            <Button
              variant={'destructive'}
              className='w-full bg-slate-50 shadow-xl  text-black'
              color='black'>
              Pedido Pendente
            </Button>
            <Button
              variant={'destructive'}
              className='w-full bg-slate-50 shadow-xl  text-black'
              color='black'>
              Pedido Concluido
            </Button>

          </div>
        </Collapsible>
        <Collapsible title={"Conversas"}>
          <p className="text-muted-foreground">Em breve...</p>
        </Collapsible>

      </div>
    </StoreLayout>
  );
};

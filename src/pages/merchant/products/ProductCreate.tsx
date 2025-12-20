/**
 * Página de criação de produtos
 * Permite ao merchant criar um novo produto com upload de imagem e customizações
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { MerchantLayout } from '@/components/layout/MerchantLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/cards';
import { Button } from '@/components/ui/buttons';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/forms/Textarea';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/shared/LoadingState';
import { useMerchantAuth } from '@/hooks/useMerchantAuth';
import { ProductService } from '@/services/products/productService';
import { showSuccessToast, showErrorToast } from '@/utils/toast';

const PRODUCT_FAMILIES = [
  { value: 'finished_product', label: 'Produto Acabado' },
  { value: 'raw_material', label: 'Matéria Prima' },
  { value: 'addon', label: 'Adicional' },
] as const;

const CUSTOMIZATION_TYPES = [
  { value: 'extra', label: 'Extra' },
  { value: 'sauce', label: 'Molho' },
  { value: 'base', label: 'Base' },
  { value: 'protein', label: 'Proteína' },
  { value: 'topping', label: 'Cobertura' },
] as const;

const SELECTION_TYPES = [
  { value: 'quantity', label: 'Quantidade' },
  { value: 'boolean', label: 'Sim/Não' },
] as const;

interface Customization {
  tempId: string;
  name: string;
  customizationType: 'extra' | 'sauce' | 'base' | 'protein' | 'topping';
  price: number;
  selectionType: 'quantity' | 'boolean';
  selectionGroup?: string;
}

export const ProductCreate: React.FC = () => {
  const navigate = useNavigate();
  const { merchant } = useMerchantAuth();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Estados do formulário - Campos obrigatórios
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [family, setFamily] = useState<'raw_material' | 'finished_product' | 'addon'>('finished_product');
  const [category, setCategory] = useState('');

  // Estados do formulário - Campos opcionais
  const [description, setDescription] = useState('');
  const [costPrice, setCostPrice] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [preparationTime, setPreparationTime] = useState<number>(0);

  // Informações nutricionais
  const [calories, setCalories] = useState<number>(0);
  const [protein, setProtein] = useState<number>(0);
  const [carbs, setCarbs] = useState<number>(0);
  const [fat, setFat] = useState<number>(0);

  // Customizações
  const [customizations, setCustomizations] = useState<Customization[]>([]);

  // Obter storeId do merchant
  const storeId = useMemo(() => {
    try {
      const savedUserStr = localStorage.getItem('store-flow-user');
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if ('role' in savedUser && 'stores' in savedUser && savedUser.stores) {
          if (savedUser.stores.length > 0) {
            if (savedUser.stores.length === 1) {
              return savedUser.stores[0].id;
            }
            const activeStore = savedUser.stores.find((store: { is_active: boolean }) => store.is_active);
            if (activeStore) return activeStore.id;
            return savedUser.stores[0]?.id || null;
          }
        }
        if (savedUser?.storeId) {
          return savedUser.storeId;
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

  // Handler de upload de imagem
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showErrorToast(new Error('Arquivo muito grande. Tamanho máximo: 5MB'), 'Erro');
      return;
    }

    // Validar tipo
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showErrorToast(
        new Error('Tipo de arquivo não permitido. Use JPEG, PNG ou WebP'),
        'Erro'
      );
      return;
    }

    setImageFile(file);

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remover imagem
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageUrl('');
  };

  // Adicionar customização
  const handleAddCustomization = () => {
    const newCustomization: Customization = {
      tempId: `temp-${Date.now()}`,
      name: '',
      customizationType: 'extra',
      price: 0,
      selectionType: 'quantity',
      selectionGroup: '',
    };
    setCustomizations([...customizations, newCustomization]);
  };

  // Remover customização
  const handleRemoveCustomization = (tempId: string) => {
    setCustomizations(customizations.filter(c => c.tempId !== tempId));
  };

  // Atualizar customização
  const handleUpdateCustomization = (tempId: string, field: keyof Customization, value: any) => {
    setCustomizations(
      customizations.map(c => (c.tempId === tempId ? { ...c, [field]: value } : c))
    );
  };

  // Salvar produto
  const handleSave = async () => {
    if (!storeId) {
      showErrorToast(new Error('Loja não encontrada'), 'Erro');
      return;
    }

    // Validações básicas
    if (!name.trim()) {
      showErrorToast(new Error('Nome do produto é obrigatório'), 'Erro');
      return;
    }
    if (price <= 0) {
      showErrorToast(new Error('Preço deve ser maior que zero'), 'Erro');
      return;
    }
    if (!category.trim()) {
      showErrorToast(new Error('Categoria é obrigatória'), 'Erro');
      return;
    }

    try {
      setLoading(true);

      // Preparar dados do produto
      const productData: any = {
        name: name.trim(),
        price,
        family,
        category: category.trim(),
        description: description.trim() || undefined,
        costPrice: costPrice || 0,
        customCategory: customCategory.trim() || undefined,
        isActive,
        preparationTime: preparationTime || 0,
      };

      // Adicionar informações nutricionais se fornecidas
      if (calories > 0 || protein > 0 || carbs > 0 || fat > 0) {
        productData.nutritionalInfo = {
          calories: calories || 0,
          protein: protein || 0,
          carbs: carbs || 0,
          fat: fat || 0,
        };
      }

      // Adicionar customizações se houver
      if (customizations.length > 0) {
        productData.customizations = customizations
          .filter(c => c.name.trim())
          .map(c => ({
            name: c.name.trim(),
            customizationType: c.customizationType,
            price: c.price || 0,
            selectionType: c.selectionType,
            selectionGroup: c.selectionGroup?.trim() || undefined,
          }));
      }

      // Se houver arquivo de imagem, usar multipart/form-data
      if (imageFile) {
        const formData = new FormData();
        formData.append('data', JSON.stringify(productData));
        formData.append('file', imageFile);

        await ProductService.createProduct(storeId, formData);
      } else {
        // Caso contrário, usar JSON simples
        if (imageUrl.trim()) {
          productData.imageUrl = imageUrl.trim();
        }
        await ProductService.createProduct(storeId, productData);
      }

      showSuccessToast('Produto criado com sucesso!', 'Sucesso');
      
      // Aguardar um pouco para garantir que foi salvo
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Voltar para a lista de produtos
      navigate('/merchant/products');
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      showErrorToast(error as Error, 'Erro ao criar produto');
    } finally {
      setLoading(false);
    }
  };

  if (!storeId) {
    return (
      <MerchantLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Nenhuma loja encontrada</p>
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout>
      {/* Overlay de Loading */}
      {loading && (
        <LoadingState 
          message="Criando produto... Por favor, aguarde enquanto o produto é criado."
          size="lg"
          fullScreen
        />
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/merchant/products')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Novo Produto</h1>
              <p className="text-gray-600 mt-1">Crie um novo produto para sua loja</p>
            </div>
          </div>
        </div>

        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Informações Básicas</h2>
            <p className="text-sm text-gray-600 mt-1">Dados principais do produto</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Nome do Produto <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Ex: Hambúrguer Artesanal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={200}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Descrição</label>
                <Textarea
                  placeholder="Descreva seu produto..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500">{description.length}/1000 caracteres</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Preço (R$) <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={price || ''}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Custo (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={costPrice || ''}
                  onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Tipo <span className="text-destructive">*</span>
                </label>
                <select
                  value={family}
                  onChange={(e) => setFamily(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  {PRODUCT_FAMILIES.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Categoria <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Ex: Hambúrgueres"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Categoria Personalizada</label>
                <Input
                  placeholder="Ex: Gourmet"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Tempo de Preparo (minutos)
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={preparationTime || ''}
                  onChange={(e) => setPreparationTime(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2 flex items-center gap-3 md:col-span-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label className="text-sm font-medium text-foreground">Produto ativo</label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Imagem do Produto */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Imagem do Produto</h2>
            <p className="text-sm text-gray-600 mt-1">
              Formatos aceitos: JPEG, PNG, WebP. Tamanho máximo: 5MB
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-w-md h-64 object-cover rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Clique para fazer upload
                  </p>
                  <p className="text-xs text-gray-500">ou arraste e solte uma imagem aqui</p>
                </label>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Ou forneça uma URL da imagem
              </label>
              <Input
                placeholder="https://exemplo.com/imagem.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                maxLength={500}
                disabled={!!imageFile}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações Nutricionais */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Informações Nutricionais (Opcional)</h2>
            <p className="text-sm text-gray-600 mt-1">Valores por porção</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Calorias (kcal)</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={calories || ''}
                  onChange={(e) => setCalories(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Proteínas (g)</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={protein || ''}
                  onChange={(e) => setProtein(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Carboidratos (g)</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={carbs || ''}
                  onChange={(e) => setCarbs(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Gorduras (g)</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={fat || ''}
                  onChange={(e) => setFat(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customizações */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Customizações (Opcional)</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Adicione opções de personalização para o produto
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleAddCustomization} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {customizations.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                Nenhuma customização adicionada. Clique em "Adicionar" para criar uma.
              </p>
            ) : (
              <div className="space-y-4">
                {customizations.map((customization) => (
                  <div
                    key={customization.tempId}
                    className="border rounded-lg p-4 space-y-3 bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Customização</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCustomization(customization.tempId)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Nome</label>
                        <Input
                          placeholder="Ex: Bacon Extra"
                          value={customization.name}
                          onChange={(e) =>
                            handleUpdateCustomization(customization.tempId, 'name', e.target.value)
                          }
                          maxLength={100}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Preço (R$)</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={customization.price || ''}
                          onChange={(e) =>
                            handleUpdateCustomization(
                              customization.tempId,
                              'price',
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Tipo</label>
                        <select
                          value={customization.customizationType}
                          onChange={(e) =>
                            handleUpdateCustomization(
                              customization.tempId,
                              'customizationType',
                              e.target.value
                            )
                          }
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          {CUSTOMIZATION_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Seleção</label>
                        <select
                          value={customization.selectionType}
                          onChange={(e) =>
                            handleUpdateCustomization(
                              customization.tempId,
                              'selectionType',
                              e.target.value
                            )
                          }
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          {SELECTION_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-foreground">
                          Grupo (Opcional)
                        </label>
                        <Input
                          placeholder="Ex: Adicionais"
                          value={customization.selectionGroup || ''}
                          onChange={(e) =>
                            handleUpdateCustomization(
                              customization.tempId,
                              'selectionGroup',
                              e.target.value
                            )
                          }
                          maxLength={50}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-4 pb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/merchant/products')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} loading={loading} disabled={loading} size="lg" className="gap-2">
            <Save className="h-4 w-4" />
            Criar Produto
          </Button>
        </div>
      </div>
    </MerchantLayout>
  );
};


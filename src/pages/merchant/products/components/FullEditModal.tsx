/**
 * Modal de Edição Completa de Produto
 * Permite editar todos os campos do produto, incluindo:
 * - Informações básicas (nome, descrição, categoria)
 * - Preços (venda e custo)
 * - Família do produto
 * - Tempo de preparação
 * - Status (ativo/inativo)
 * - Upload de imagem
 * - Informações nutricionais (futuro)
 * - Customizações (futuro)
 */

import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Package, Loader2 } from 'lucide-react';
import type { ProductApiResponse } from '@/services/products/productService';
import { Button } from '@/components/ui/buttons';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/forms/Textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch/Switch';
import { formatPrice } from '@/utils';
import { cn } from '@/utils';

const PRODUCT_FAMILIES = [
  { value: 'finished_product', label: 'Produto Acabado' },
  { value: 'raw_material', label: 'Matéria Prima' },
  { value: 'addon', label: 'Adicional' },
] as const;

interface FullEditModalProps {
  product: ProductApiResponse;
  saving: boolean;
  onSave: (productId: string, updateData: {
    name?: string;
    description?: string;
    price?: number;
    costPrice?: number;
    family?: string;
    category?: string;
    customCategory?: string;
    imageUrl?: string;
    isActive?: boolean;
    preparationTime?: number;
  }) => Promise<void>;
  onClose: () => void;
}

export const FullEditModal: React.FC<FullEditModalProps> = ({
  product,
  saving,
  onSave,
  onClose,
}) => {
  // Estados do formulário
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || '',
    price: product.price,
    costPrice: product.cost_price || 0,
    family: product.family,
    category: product.category || '',
    customCategory: product.custom_category || '',
    imageUrl: product.image_url || '',
    isActive: product.is_active,
    preparationTime: product.preparation_time || 0,
  });

  // Estado para preview de imagem
  const [imagePreview, setImagePreview] = useState<string>(product.image_url || '');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Validações
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Atualizar preview quando imageUrl mudar
    if (formData.imageUrl && !imageFile) {
      setImagePreview(formData.imageUrl);
    }
  }, [formData.imageUrl, imageFile]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.length > 200) {
      newErrors.name = 'Nome deve ter no máximo 200 caracteres';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Descrição deve ter no máximo 1000 caracteres';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Preço deve ser maior que zero';
    }

    if (formData.costPrice < 0) {
      newErrors.costPrice = 'Custo não pode ser negativo';
    }

    if (!formData.category || formData.category.trim().length === 0) {
      newErrors.category = 'Categoria é obrigatória';
    } else if (formData.category.length > 100) {
      newErrors.category = 'Categoria deve ter no máximo 100 caracteres';
    }

    if (formData.customCategory && formData.customCategory.length > 100) {
      newErrors.customCategory = 'Categoria customizada deve ter no máximo 100 caracteres';
    }

    if (formData.preparationTime < 0) {
      newErrors.preparationTime = 'Tempo de preparação não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    await onSave(product.id, {
      name: formData.name !== product.name ? formData.name : undefined,
      description: formData.description !== product.description ? formData.description : undefined,
      price: formData.price !== product.price ? formData.price : undefined,
      costPrice: formData.costPrice !== product.cost_price ? formData.costPrice : undefined,
      family: formData.family !== product.family ? formData.family : undefined,
      category: formData.category !== product.category ? formData.category : undefined,
      customCategory: formData.customCategory !== product.custom_category ? formData.customCategory : undefined,
      imageUrl: formData.imageUrl !== product.image_url ? formData.imageUrl : undefined,
      isActive: formData.isActive !== product.is_active ? formData.isActive : undefined,
      preparationTime: formData.preparationTime !== product.preparation_time ? formData.preparationTime : undefined,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setErrors({ ...errors, image: 'Formato inválido. Use JPEG, PNG ou WebP' });
        return;
      }

      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: 'Imagem muito grande. Máximo 5MB' });
        return;
      }

      setImageFile(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Limpar erro de imagem
      const newErrors = { ...errors };
      delete newErrors.image;
      setErrors(newErrors);
    }
  };

  const hasChanges = 
    formData.name !== product.name ||
    formData.description !== (product.description || '') ||
    formData.price !== product.price ||
    formData.costPrice !== (product.cost_price || 0) ||
    formData.family !== product.family ||
    formData.category !== (product.category || '') ||
    formData.customCategory !== (product.custom_category || '') ||
    formData.imageUrl !== (product.image_url || '') ||
    formData.isActive !== product.is_active ||
    formData.preparationTime !== (product.preparation_time || 0) ||
    imageFile !== null;

  const calculateMargin = () => {
    if (formData.price > 0 && formData.costPrice > 0) {
      return ((formData.price - formData.costPrice) / formData.price * 100).toFixed(1);
    }
    return '0.0';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Editar Produto</h2>
            <p className="text-sm text-gray-600 mt-1">Atualize todas as informações do produto</p>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna Esquerda - Formulário */}
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
                
                {/* Nome */}
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium text-foreground">
                    Nome do Produto <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="Ex: Hambúrguer Artesanal"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={cn(errors.name && 'border-destructive')}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                  )}
                </div>

                {/* Descrição */}
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium text-foreground">Descrição</label>
                  <Textarea
                    placeholder="Descreva o produto..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className={cn(errors.description && 'border-destructive')}
                  />
                  <div className="flex justify-between text-xs">
                    <span className={cn(
                      'text-gray-500',
                      errors.description && 'text-destructive'
                    )}>
                      {errors.description || `${formData.description.length}/1000 caracteres`}
                    </span>
                  </div>
                </div>

                {/* Categoria */}
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium text-foreground">
                    Categoria <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="Ex: Hambúrgueres"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={cn(errors.category && 'border-destructive')}
                  />
                  {errors.category && (
                    <p className="text-xs text-destructive">{errors.category}</p>
                  )}
                </div>

                {/* Categoria Customizada */}
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium text-foreground">
                    Categoria Customizada
                  </label>
                  <Input
                    placeholder="Ex: Gourmet, Premium..."
                    value={formData.customCategory}
                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                    className={cn(errors.customCategory && 'border-destructive')}
                  />
                  {errors.customCategory && (
                    <p className="text-xs text-destructive">{errors.customCategory}</p>
                  )}
                </div>

                {/* Família do Produto */}
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium text-foreground">
                    Família do Produto
                  </label>
                  <select
                    value={formData.family}
                    onChange={(e) => setFormData({ ...formData, family: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {PRODUCT_FAMILIES.map((fam) => (
                      <option key={fam.value} value={fam.value}>
                        {fam.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preços */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preços</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Preço de Venda */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Preço (R$) <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className={cn(errors.price && 'border-destructive')}
                    />
                    {errors.price && (
                      <p className="text-xs text-destructive">{errors.price}</p>
                    )}
                  </div>

                  {/* Preço de Custo */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Custo (R$)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.costPrice || ''}
                      onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                      className={cn(errors.costPrice && 'border-destructive')}
                    />
                    {errors.costPrice && (
                      <p className="text-xs text-destructive">{errors.costPrice}</p>
                    )}
                  </div>
                </div>

                {/* Margem de Lucro */}
                {formData.price > 0 && formData.costPrice > 0 && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-900">
                      💰 Margem de Lucro: {calculateMargin()}%
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Lucro: {formatPrice(formData.price - formData.costPrice)}
                    </p>
                  </div>
                )}
              </div>

              {/* Configurações */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações</h3>
                
                {/* Tempo de Preparação */}
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium text-foreground">
                    Tempo de Preparação (minutos)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.preparationTime || ''}
                    onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) || 0 })}
                    className={cn(errors.preparationTime && 'border-destructive')}
                  />
                  {errors.preparationTime && (
                    <p className="text-xs text-destructive">{errors.preparationTime}</p>
                  )}
                </div>

                {/* Status Ativo */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-foreground">Produto Ativo</label>
                    <p className="text-xs text-gray-500">Disponível para venda</p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Coluna Direita - Preview e Imagem */}
            <div className="space-y-6">
              {/* Preview do Produto */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
                
                <div className="border rounded-lg overflow-hidden bg-white">
                  {/* Imagem */}
                  <div className="relative w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt={formData.name}
                        className="w-full h-full object-cover"
                        onError={() => setImagePreview('')}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <Package className="h-16 w-16 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500">Sem imagem</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-lg">{formData.name || 'Nome do Produto'}</h4>
                      <Badge variant={formData.isActive ? 'default' : 'secondary'}>
                        {formData.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {formData.description || 'Sem descrição'}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Preço</p>
                        <span className="font-bold text-primary text-lg block">
                          {formatPrice(formData.price)}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Categoria</p>
                        <Badge variant="secondary" className="text-xs">
                          {formData.category || 'Sem categoria'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload de Imagem */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Imagem do Produto</h3>
                
                {/* URL da Imagem */}
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium text-foreground">URL da Imagem</label>
                  <Input
                    placeholder="https://exemplo.com/imagem.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">
                    Ou faça upload de uma imagem abaixo
                  </p>
                </div>

                {/* Upload de Arquivo */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={saving}
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Clique para fazer upload
                    </p>
                    <p className="text-xs text-gray-500">
                      JPEG, PNG ou WebP (máx. 5MB)
                    </p>
                    {imageFile && (
                      <Badge variant="outline" className="mt-3">
                        {imageFile.name}
                      </Badge>
                    )}
                  </label>
                </div>
                {errors.image && (
                  <p className="text-xs text-destructive mt-2">{errors.image}</p>
                )}
              </div>
            </div>
          </div>

          {/* Aviso de Alterações */}
          {hasChanges && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-800">
                ⚠️ Você tem alterações não salvas
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            loading={saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};


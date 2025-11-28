import { useState, useEffect } from 'react';
import type { DeliveryAddress } from '@/types';
import type { Customer } from '@/types/auth';
import type { FulfillmentMethod } from '../types';

export const useCheckoutAddress = (
  user: Customer | null,
  isCustomer: boolean,
  fulfillmentMethod: FulfillmentMethod
) => {
  const [address, setAddress] = useState<DeliveryAddress>({
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    complement: '',
    reference: '',
  });
  
  const [isAddressFromProfile, setIsAddressFromProfile] = useState(false);
  const [selectedAddressType, setSelectedAddressType] = useState<'home' | 'work' | null>(null);

  useEffect(() => {
    if (user && isCustomer && fulfillmentMethod === 'delivery') {
      // Verificar se já tem endereço preenchido manualmente (não do perfil)
      const hasManualAddress = !isAddressFromProfile && (address.street.trim() || address.number.trim() || address.city.trim());
      
      if (!hasManualAddress && user.addresses) {
        let defaultAddress: (typeof user.addresses.home) | undefined;
        let addressType: 'home' | 'work' | null = null;
        
        if (user.addresses.home?.isDefault) {
          defaultAddress = user.addresses.home;
          addressType = 'home';
        } else if (user.addresses.work?.isDefault) {
          defaultAddress = user.addresses.work;
          addressType = 'work';
        } else if (user.addresses.home) {
          defaultAddress = user.addresses.home;
          addressType = 'home';
        } else if (user.addresses.work) {
          defaultAddress = user.addresses.work;
          addressType = 'work';
        }
        
        if (defaultAddress) {
          setAddress({
            street: defaultAddress.street || '',
            number: defaultAddress.number || '',
            neighborhood: defaultAddress.neighborhood || '',
            city: defaultAddress.city || '',
            state: defaultAddress.state || '',
            zipCode: defaultAddress.zipCode || '',
            complement: defaultAddress.complement || '',
            reference: defaultAddress.reference || '',
          });
          setIsAddressFromProfile(true);
          setSelectedAddressType(addressType);
        }
      }
    } else if (fulfillmentMethod === 'pickup') {
      setIsAddressFromProfile(false);
      setSelectedAddressType(null);
    }
  }, [user, isCustomer, fulfillmentMethod]);

  const handleChangeAddressType = (type: 'home' | 'work') => {
    if (!user || !isCustomer) return;
    
    const selectedAddress = type === 'home' ? user.addresses?.home : user.addresses?.work;
    
    if (selectedAddress) {
      setAddress({
        street: selectedAddress.street || '',
        number: selectedAddress.number || '',
        neighborhood: selectedAddress.neighborhood || '',
        city: selectedAddress.city || '',
        state: selectedAddress.state || '',
        zipCode: selectedAddress.zipCode || '',
        complement: selectedAddress.complement || '',
        reference: selectedAddress.reference || '',
      });
      setIsAddressFromProfile(true);
      setSelectedAddressType(type);
    }
  };

  const handleEnableManualEdit = () => {
    setIsAddressFromProfile(false);
    setSelectedAddressType(null);
  };

  const getAddressSummary = (): string => {
    if (!address.street || !address.number) return '';
    const parts = [
      `${address.street}, ${address.number}`,
      address.neighborhood,
      address.city,
      address.state,
    ].filter(Boolean);
    return parts.join(' - ');
  };

  return {
    address,
    setAddress,
    isAddressFromProfile,
    selectedAddressType,
    handleChangeAddressType,
    handleEnableManualEdit,
    getAddressSummary,
  };
};


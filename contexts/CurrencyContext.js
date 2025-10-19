import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const CurrencyContext = createContext();

const CURRENCIES = [
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro', locale: 'pt-BR' },
  { code: 'USD', symbol: '$', name: 'Dólar Americano', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'Libra Esterlina', locale: 'en-GB' },
  { code: 'JPY', symbol: '¥', name: 'Iene Japonês', locale: 'ja-JP' },
  { code: 'CAD', symbol: 'C$', name: 'Dólar Canadense', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', name: 'Dólar Australiano', locale: 'en-AU' },
  { code: 'CHF', symbol: 'CHF', name: 'Franco Suíço', locale: 'de-CH' },
  { code: 'CNY', symbol: '¥', name: 'Yuan Chinês', locale: 'zh-CN' },
  { code: 'INR', symbol: '₹', name: 'Rupia Indiana', locale: 'en-IN' },
];

export const CurrencyProvider = ({ children }) => {
  const { user } = useAuth();
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [loading, setLoading] = useState(true);

  const getCurrencyStorageKey = () => {
    return user ? `@currency_settings_${user.uid}` : '@currency_settings';
  };

  useEffect(() => {
    if (user) {
      loadCurrencySettings();
    } else {
      setCurrency(CURRENCIES[0]);
      setLoading(false);
    }
  }, [user]);

  const loadCurrencySettings = async () => {
    try {
      const storageKey = getCurrencyStorageKey();
      const savedCurrency = await AsyncStorage.getItem(storageKey);
      if (savedCurrency) {
        const parsedCurrency = JSON.parse(savedCurrency);
        const foundCurrency = CURRENCIES.find(c => c.code === parsedCurrency.code);
        if (foundCurrency) {
          setCurrency(foundCurrency);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de moeda:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCurrency = async (newCurrency) => {
    try {
      const storageKey = getCurrencyStorageKey();
      await AsyncStorage.setItem(storageKey, JSON.stringify(newCurrency));
      setCurrency(newCurrency);
    } catch (error) {
      console.error('Erro ao salvar configurações de moeda:', error);
      throw error;
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return `${currency.symbol} 0,00`;
    }

    const formattedValue = Number(amount).toLocaleString(currency.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `${currency.symbol} ${formattedValue}`;
  };

  const formatCurrencyInput = (value) => {
    if (!value) return '';
    
    const numericValue = value.replace(/\D/g, '');
    if (numericValue === '') return '';
    
    const formattedValue = (numericValue / 100).toLocaleString(currency.locale, {
      minimumFractionDigits: 2,
    });
    
    return `${currency.symbol} ${formattedValue}`;
  };

  const parseCurrency = (formattedValue) => {
    if (!formattedValue) return '';
    
    const numericValue = formattedValue.replace(/\D/g, '');
    return (numericValue / 100).toFixed(2);
  };

  const value = {
    currency,
    currencies: CURRENCIES,
    loading,
    updateCurrency,
    formatCurrency,
    formatCurrencyInput,
    parseCurrency,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency deve ser usado dentro de um CurrencyProvider');
  }
  return context;
};

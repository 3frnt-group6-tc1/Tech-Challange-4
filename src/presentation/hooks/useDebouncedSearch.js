import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook para debounce de termos de busca
 * Evita buscas excessivas enquanto o usuário ainda está digitando
 * 
 * @param {string} searchTerm - Termo de busca atual
 * @param {number} delay - Delay em ms (padrão: 500ms)
 * @returns {string} Termo de busca com debounce aplicado
 */
export const useDebouncedSearch = (searchTerm, delay = 500) => {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, delay]);

  return debouncedTerm;
};

/**
 * Hook avançado para debounce com callback
 * Permite executar uma função com debounce
 * 
 * @param {Function} callback - Função a ser executada com debounce
 * @param {number} delay - Delay em ms (padrão: 500ms)
 * @returns {Function} Função com debounce aplicado
 */
export const useDebouncedCallback = (callback, delay = 500) => {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  // Manter referência atualizada do callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (...args) => {
      // Limpar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Configurar novo timeout
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

/**
 * Hook para debounce de valor com estado
 * Retorna o valor com debounce e funções para controle
 * 
 * @param {any} initialValue - Valor inicial
 * @param {number} delay - Delay em ms (padrão: 500ms)
 * @returns {Object} { value, debouncedValue, setValue, flush, cancel }
 */
export const useDebouncedValue = (initialValue = "", delay = 500) => {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const timeoutRef = useRef(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  // Força atualização imediata (ignora debounce)
  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setDebouncedValue(value);
  }, [value]);

  // Cancela o debounce pendente
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Reset para valor inicial
  const reset = useCallback(() => {
    setValue(initialValue);
    setDebouncedValue(initialValue);
  }, [initialValue]);

  return {
    value,
    debouncedValue,
    setValue,
    flush,
    cancel,
    reset,
  };
};

/**
 * Hook para busca com debounce e loading state
 * Combina debounce com indicador de "pesquisando"
 * 
 * @param {string} searchTerm - Termo de busca
 * @param {number} delay - Delay em ms (padrão: 500ms)
 * @returns {Object} { debouncedTerm, isSearching }
 */
export const useSearchWithLoading = (searchTerm, delay = 500) => {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);
  const [isSearching, setIsSearching] = useState(false);
  const previousTermRef = useRef(searchTerm);

  useEffect(() => {
    // Se o termo mudou, marcar como "pesquisando"
    if (searchTerm !== previousTermRef.current) {
      setIsSearching(true);
    }
    previousTermRef.current = searchTerm;

    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
      setIsSearching(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, delay]);

  return {
    debouncedTerm,
    isSearching,
  };
};

export default useDebouncedSearch;


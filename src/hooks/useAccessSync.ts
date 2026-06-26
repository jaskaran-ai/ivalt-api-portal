import { useCallback, useState, useEffect } from 'react';

export function useAccessSync() {
  const [status, setStatus] = useState<string | null>(null);
  const [hasUseCase, setHasUseCase] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage immediately on mount
  useEffect(() => {
    const localStatus = localStorage.getItem('ivalt_access_status');
    const localHasUsecase = localStorage.getItem('ivalt_has_usecase') === 'true';
    setStatus(localStatus);
    setHasUseCase(localHasUsecase);
    setIsLoading(false);
  }, []);

  const syncAccessStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/access/me');
      if (res.ok) {
        const data = await res.json();
        const freshStatus = data.status;
        const freshHasUseCase = !!(
          data.request?.useCase &&
          data.request.useCase.trim() !== ''
        );

        localStorage.setItem('ivalt_access_status', freshStatus);
        localStorage.setItem('ivalt_has_usecase', String(freshHasUseCase));
        
        setStatus(freshStatus);
        setHasUseCase(freshHasUseCase);
        return { status: freshStatus, hasUseCase: freshHasUseCase, ok: true };
      }
      localStorage.removeItem('ivalt_access_status');
      localStorage.removeItem('ivalt_has_usecase');
      setStatus(null);
      setHasUseCase(false);
      return { status: null, hasUseCase: false, ok: false };
    } catch (err) {
      console.error('[useAccessSync] Sync failed:', err);
      return { status, hasUseCase, ok: false };
    }
  }, [status, hasUseCase]);

  const updateLocalState = useCallback((newStatus: string, newHasUseCase: boolean) => {
    localStorage.setItem('ivalt_access_status', newStatus);
    localStorage.setItem('ivalt_has_usecase', String(newHasUseCase));
    setStatus(newStatus);
    setHasUseCase(newHasUseCase);
  }, []);

  const clearLocalState = useCallback(() => {
    localStorage.removeItem('ivalt_access_status');
    localStorage.removeItem('ivalt_has_usecase');
    setStatus(null);
    setHasUseCase(false);
  }, []);

  return {
    status,
    hasUseCase,
    isLoading,
    syncAccessStatus,
    updateLocalState,
    clearLocalState,
  };
}

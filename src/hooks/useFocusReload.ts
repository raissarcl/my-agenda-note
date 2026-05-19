import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

export function useFocusReload(reload: () => Promise<void>) {
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      void reload().finally(() => {
        if (!cancelled) setLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }, [reload])
  );

  return { loading, setLoading };
}

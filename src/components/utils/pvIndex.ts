import PersistentVolume from '@kinvolk/headlamp-plugin/lib/k8s/persistentVolume';
import React from 'react';

export function usePvIndex() {
  const [pvIndex, setPvIndex] = React.useState<Map<string, any>>(new Map());
  React.useEffect(() => {
    let unsub: (() => void) | null = null;
    const run = PersistentVolume.apiList((items: any[]) => {
      const m = new Map<string, any>();
      items?.forEach((pv: any) => {
        const name = pv?.metadata?.name;
        if (name) m.set(name, pv);
      });
      setPvIndex(m);
    });
    const p = run();
    p.then(u => {
      unsub = u || null;
    }).catch((err: any) => {
      console.error('Failed to list PVs for PvIndex', err);
    });
    return () => {
      try {
        unsub && unsub();
      } catch {}
    };
  }, []);
  return pvIndex;
}

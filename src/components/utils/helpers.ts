import Pod from '@kinvolk/headlamp-plugin/lib/k8s/pod';
import { useEffect, useState } from 'react';

export function useDaemonSetNodes(label: string) {
  const [nodeNames, setNodeNames] = useState<string[]>([]);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchPods = Pod.apiList(
      (pods: any[]) => {
        const uniqueNodes = new Set<string>();
        pods.forEach(pod => {
          const nodeName = pod.spec?.nodeName;
          if (nodeName) {
            uniqueNodes.add(nodeName);
          }
        });
        setNodeNames(Array.from(uniqueNodes));
      },
      (err: any) => {
        setError(err);
        setNodeNames([]);
      },
      {
        queryParams: { labelSelector: label }
      }
    );
    const unsubscribePromise = fetchPods();
    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, [label]);

  return { nodeNames, error };
}

export function createNodeFilter(nodeNames: string[]) {
  return (item: any) => {
    return nodeNames.includes(item.metadata?.name);
  };
}

export function formatBytes(bytes: string | number): string {
  const size = typeof bytes === 'string' ? parseInt(bytes) : bytes;
  if (isNaN(size) || size === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
  const i = Math.floor(Math.log(size) / Math.log(k));
  
  return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function calculateUsagePercent(used: string | number, free: string | number): number {
  const usedBytes = typeof used === 'string' ? parseInt(used) : used;
  const freeBytes = typeof free === 'string' ? parseInt(free) : free;
  
  if (isNaN(usedBytes) || isNaN(freeBytes)) return 0;
  
  const totalBytes = usedBytes + freeBytes;
  return totalBytes > 0 ? Math.round((usedBytes / totalBytes) * 100) : 0;
}

export function getUsageColor(percent: number): string {
  if (percent > 80) return '#f44336';
  if (percent > 60) return '#ff9800';
  return '#4caf50';
}

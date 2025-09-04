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
        queryParams: { labelSelector: label },
      },
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

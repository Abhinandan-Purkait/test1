import { makeCustomResourceClass } from '@kinvolk/headlamp-plugin/lib/lib/k8s/crd';

export function zfsNodeClass() {
  const group = 'zfs.openebs.io';
  const version = 'v1';

  const ZFSNode = makeCustomResourceClass({
    apiInfo: [{ group, version }],
    isNamespaced: true,
    singularName: 'ZFSNode',
    pluralName: 'zfsnodes',
  });

  return class ExtendedZFSNode extends ZFSNode {
    static get detailsRoute() {
      return 'zfs-node-detail';
    }

    // Helper to format bytes to human readable
    formatBytes(bytes: string | number): string {
      const size = typeof bytes === 'string' ? parseInt(bytes) : bytes;
      if (size === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
      const i = Math.floor(Math.log(size) / Math.log(k));
      return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  };
}

import { makeCustomResourceClass } from '@kinvolk/headlamp-plugin/lib/lib/k8s/crd';

export function lvmNodeClass() {
  const group = 'local.openebs.io';
  const version = 'v1alpha1';

  const LVMNode = makeCustomResourceClass({
    apiInfo: [{ group, version }],
    isNamespaced: true,
    singularName: 'LVMNode',
    pluralName: 'lvmnodes',
  });

  return class ExtendedLVMNode extends LVMNode {
    static get detailsRoute() {
      return 'lvm-node-detail';
    }

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

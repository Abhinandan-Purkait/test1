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
  };
}

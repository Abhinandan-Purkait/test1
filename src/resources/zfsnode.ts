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
  };
}

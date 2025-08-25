import { makeCustomResourceClass } from '@kinvolk/headlamp-plugin/lib/lib/k8s/crd';

export function zfsSnapshotClass() {
  const zfsSnapshotGroup = 'zfs.openebs.io';
  const zfsSnapshotVersion = 'v1';

  const ZfsSnapshot = makeCustomResourceClass({
    apiInfo: [{ group: zfsSnapshotGroup, version: zfsSnapshotVersion }],
    isNamespaced: true,
    singularName: 'ZFSSnapshots',
    pluralName: 'zfssnapshots',
  });

  return class extendedZfsSnapshotClass extends ZfsSnapshot {
    static get detailsRoute() {
      return 'zfssnapshot-detail';
    }

    get spec() {
      return this.jsonData.spec;
    }

    get status() {
      return this.jsonData.status;
    }
  };
}

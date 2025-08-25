import { makeCustomResourceClass } from '@kinvolk/headlamp-plugin/lib/lib/k8s/crd';

export function lvmSnapshotClass() {
  const lvmSnapshotGroup = 'local.openebs.io';
  const lvmSnapshotVersion = 'v1alpha1';

  const LvmSnapshot = makeCustomResourceClass({
    apiInfo: [{ group: lvmSnapshotGroup, version: lvmSnapshotVersion }],
    isNamespaced: true,
    singularName: 'LVMSnapshots',
    pluralName: 'lvmsnapshots',
  });

  return class extendedLvmSnapshotClass extends LvmSnapshot {
    static get detailsRoute() {
      return 'lvmsnapshot-detail';
    }

    get spec() {
      return this.jsonData.spec;
    }

    get status() {
      return this.jsonData.status;
    }
  };
}

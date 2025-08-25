import { makeCustomResourceClass } from '@kinvolk/headlamp-plugin/lib/lib/k8s/crd';

export function volumeSnapshotClass() {
  const group = 'snapshot.storage.k8s.io';
  const version = 'v1';

  const VolumeSnapshot = makeCustomResourceClass({
    apiInfo: [{ group, version }],
    isNamespaced: true,
    singularName: 'VolumeSnapshot',
    pluralName: 'volumesnapshots',
  });

  return class ExtendedVolumeSnapshot extends VolumeSnapshot {
    static get detailsRoute() {
      return 'volumesnapshot-detail';
    }

    get spec() {
      return this.jsonData.spec;
    }

    get status() {
      return this.jsonData.status;
    }

    get sourcePVCName() {
      return this.jsonData.spec?.source?.persistentVolumeClaimName || '-';
    }

    get volumeSnapshotClassName() {
      return this.jsonData.spec?.volumeSnapshotClassName || '-';
    }

    get readyToUse() {
      return this.jsonData.status?.readyToUse || false;
    }

    get restoreSize() {
      return this.jsonData.status?.restoreSize || '-';
    }

    get creationTime() {
      return this.jsonData.status?.creationTime || '-';
    }
  };
}

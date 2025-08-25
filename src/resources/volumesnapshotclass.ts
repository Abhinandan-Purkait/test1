import { makeCustomResourceClass } from '@kinvolk/headlamp-plugin/lib/lib/k8s/crd';

export function volumeSnapshotClassClass() {
  const group = 'snapshot.storage.k8s.io';
  const version = 'v1';

  const VolumeSnapshotClass = makeCustomResourceClass({
    apiInfo: [{ group, version }],
    isNamespaced: false,
    singularName: 'VolumeSnapshotClass',
    pluralName: 'volumesnapshotclasses',
  });

  return class ExtendedVolumeSnapshotClass extends VolumeSnapshotClass {
    static get detailsRoute() {
      return 'volumesnapshotclass-detail';
    }

    get driver() {
      return this.jsonData.driver;
    }

    get deletionPolicy() {
      return this.jsonData.deletionPolicy || 'Delete';
    }

    get parameters() {
      return this.jsonData.parameters || {};
    }
  };
}

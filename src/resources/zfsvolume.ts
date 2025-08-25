import { makeCustomResourceClass } from '@kinvolk/headlamp-plugin/lib/lib/k8s/crd';

export function zfsVolumeClass() {
  const group = 'zfs.openebs.io';
  const version = 'v1';

  const Base = makeCustomResourceClass({
    apiInfo: [{ group, version }],
    isNamespaced: true,
    singularName: 'ZFSVolumes',
    pluralName: 'zfsvolumes',
  });

  return class ZfsVolume extends Base {
    static get detailsRoute() {
      return 'zfsvolume-detail';
    }

    get spec() {
      return this.jsonData.spec;
    }

    get status() {
      return this.jsonData.status;
    }
  };
}

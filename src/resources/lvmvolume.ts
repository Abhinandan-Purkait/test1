import { makeCustomResourceClass } from '@kinvolk/headlamp-plugin/lib/lib/k8s/crd';

export function lvmVolumeClass() {
  const group = 'local.openebs.io';
  const version = 'v1alpha1';

  const Base = makeCustomResourceClass({
    apiInfo: [{ group, version }],
    isNamespaced: true,
    singularName: 'LVMVolumes',
    pluralName: 'lvmvolumes',
  });

  return class LvmVolume extends Base {
    static get detailsRoute() {
      return 'lvmvolume-detail';
    }

    get spec() {
      return this.jsonData.spec;
    }

    get status() {
      return this.jsonData.status;
    }
  };
}

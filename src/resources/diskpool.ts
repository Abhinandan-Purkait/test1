import { makeCustomResourceClass } from '@kinvolk/headlamp-plugin/lib/lib/k8s/crd';

export function diskPoolClass() {
  const diskPoolGroup = 'openebs.io';
  const diskPoolVersion = 'v1beta3';

  const DiskPool = makeCustomResourceClass({
    apiInfo: [{ group: diskPoolGroup, version: diskPoolVersion }],
    isNamespaced: true,
    singularName: 'DiskPool',
    pluralName: 'diskpools',
  });

  return class extendedDiskPoolClass extends DiskPool {
    static get detailsRoute() {
      return 'diskpool-detail';
    }

    get spec() {
      return this.jsonData.spec;
    }

    get status() {
      return this.jsonData.status;
    }
  };
}

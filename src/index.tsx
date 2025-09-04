import { registerRoute, registerSidebarEntry } from '@kinvolk/headlamp-plugin/lib';
import { UnifiedNodesList } from './components/unified/UnifiedNodeList';
import { UnifiedVolumes } from './components/unified/volumes/UnifiedVolumes';
import { LVMVolumeDetails } from './components/unified/volumes/LVMVolumeDetails';
import { ZFSVolumeDetails } from './components/unified/volumes/ZFSVolmeDetails';
import { UnifiedStorageClassesList } from './components/unified/UnifiedSCsList';
import { UnifiedStoragePools } from './components/unified/UnifiedStoragePools';
import { UnifiedVolumeSnapshotClassesList } from './components/unified/UnifiedVSClassesList';
import { UnifiedVolumeSnapshotsList } from './components/unified/UnifiedVSsList';
import { LVMVolumeGroupDetail } from './components/unified/storagepools/LVMVolumeGroupDetail';
import { ZFSPoolDetail } from './components/unified/storagepools/ZFSPoolDetail';
import { DiskPoolDetail } from './components/unified/storagepools/MayastorDiskPoolDetail';
import { VolumeSnapshotDetail } from './components/unified/VSDetail';
import { VolumeSnapshotClassDetail } from './components/unified/VSClassDetail';
import { UnifiedPVCsList } from './components/unified/UnifiedPVCsList';
import { registerDCLogo } from './assets/DCLogo';
import { registerDCIcon } from './assets/DCArrowIcon';

registerDCIcon();

// Conditionally register DCLogo based on build flag
if (import.meta.env.VITE_ENABLE_DC_LOGO === 'true') {
  registerDCLogo();
}

registerSidebarEntry({
  name: 'Puls8',
  url: '/puls8/nodes',
  icon: 'dc:arrow-icon',
  parent: null,
  label: 'Puls8',
});

registerSidebarEntry({
  name: 'puls8-nodes',
  url: '/puls8/nodes',
  parent: 'Puls8',
  label: 'Nodes',
});

registerRoute({
  path: '/puls8/nodes',
  sidebar: 'puls8-nodes',
  name: 'puls8-nodes',
  component: UnifiedNodesList,
  exact: true,
});

registerSidebarEntry({
  name: 'puls8-volumes',
  url: '/puls8/volumes',
  parent: 'Puls8',
  label: 'Volumes',
});

registerRoute({
  path: '/puls8/volumes',
  name: 'puls8-volumes',
  sidebar: 'puls8-volumes',
  exact: true,
  component: UnifiedVolumes,
});

registerRoute({
  path: '/puls8/volumes/lvm/:namespace/:name',
  name: 'lvmvolume-detail',
  exact: true,
  sidebar: 'puls8-volumes',
  component: LVMVolumeDetails,
});

registerRoute({
  path: '/puls8/volumes/zfs/:namespace/:name',
  name: 'zfsvolume-detail',
  exact: true,
  sidebar: 'puls8-volumes',
  component: ZFSVolumeDetails,
});

registerSidebarEntry({
  name: 'puls8-storage-pools',
  url: '/puls8/storage-pools',
  parent: 'Puls8',
  label: 'Storage Pools',
});

registerRoute({
  path: '/puls8/storage-pools',
  sidebar: 'puls8-storage-pools',
  name: 'puls8-storage-pools',
  component: UnifiedStoragePools,
  exact: true,
});

registerRoute({
  path: '/puls8/storage-pools/lvm/:namespace/:node/:vg',
  sidebar: 'puls8-storage-pools',
  name: 'vg-detail',
  component: LVMVolumeGroupDetail,
  exact: true,
});

registerRoute({
  path: '/puls8/storage-pools/zfs/:namespace/:node/:pool',
  sidebar: 'puls8-storage-pools',
  name: 'zpool-detail',
  component: ZFSPoolDetail,
  exact: true,
});

registerRoute({
  path: '/puls8/storage-pools/mayastor/:namespace/:name/',
  sidebar: 'puls8-storage-pools',
  name: 'diskpool-detail',
  component: DiskPoolDetail,
  exact: true,
});

registerSidebarEntry({
  name: 'puls8pvcs',
  url: '/puls8/pvcs',
  parent: 'Puls8',
  label: 'Persistent Volume Claims',
});

registerRoute({
  path: '/puls8/pvcs',
  sidebar: 'puls8pvcs',
  name: 'puls8pvcs',
  component: UnifiedPVCsList,
  exact: true,
});

registerSidebarEntry({
  name: 'puls8-scs',
  url: '/puls8/scs',
  parent: 'Puls8',
  label: 'Storage Classes',
});

registerRoute({
  path: '/puls8/scs',
  sidebar: 'puls8-scs',
  name: 'puls8-scs',
  component: UnifiedStorageClassesList,
  exact: true,
});

registerSidebarEntry({
  name: 'puls8-vcs',
  url: '/puls8/vcs',
  parent: 'Puls8',
  label: 'Volume Snapshot',
});

registerRoute({
  path: '/puls8/vcs',
  sidebar: 'puls8-vcs',
  name: 'puls8-vcs',
  component: UnifiedVolumeSnapshotsList,
  exact: true,
});

registerRoute({
  path: '/puls8/vcs/:namespace/:name',
  sidebar: 'puls8-vcs',
  name: 'volumesnapshot-detail',
  component: VolumeSnapshotDetail,
  exact: true,
});

registerSidebarEntry({
  name: 'puls8-vsclass',
  url: '/puls8/vsclass',
  parent: 'Puls8',
  label: 'Volume Snapshot Class',
});

registerRoute({
  path: '/puls8/vsclass',
  sidebar: 'puls8-vsclass',
  name: 'puls8-vsclass',
  component: UnifiedVolumeSnapshotClassesList,
  exact: true,
});

registerRoute({
  path: '/puls8/vsclass/:name',
  sidebar: 'puls8-vcslass',
  name: 'volumesnapshotclass-detail',
  component: VolumeSnapshotClassDetail,
  exact: true,
});

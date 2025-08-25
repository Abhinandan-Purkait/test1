// Label used by Mayastor io-engine DaemonSet.
export const MAYASTOR_DAEMONSET_LABEL = 'app=io-engine';

// Label used by Mayastor csi node DaemonSet.
export const MAYASTOR_CSI_DAEMONSET_LABEL = 'app=csi-node';

// Mayastor CSI provisioner name.
export const MAYASTOR_PROVISIONER = [
  'io.openebs.csi-mayastor',
];

// Label used by ZFS Node DaemonSet.
export const ZFS_NODE_DAEMONSET_LABEL = 'name=openebs-zfs-node';

// Label used by LVM Node DaemonSet.
export const LVM_NODE_DAEMONSET_LABEL = 'name=openebs-lvm-node';

// ZFS CSI provisioner name.
export const ZFS_PROVISIONER = [
  'zfs.csi.openebs.io',
];

// LVM CSI provisioner name.
export const LVM_PROVISIONER = [
  'local.csi.openebs.io',
];

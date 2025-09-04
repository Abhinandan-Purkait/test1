import React from 'react';
import {
  SectionBox,
  ResourceListView,
  ResourceLink,
} from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Box } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { lvmVolumeClass } from '../../../resources/lvmvolume';
import PersistentVolumeClaim from '@kinvolk/headlamp-plugin/lib/k8s/persistentVolumeClaim';
import Namespace from '@kinvolk/headlamp-plugin/lib/k8s/namespace';
import { formatIBytes } from '../../utils/humanize_size';
import { usePvIndex } from '../../utils/pvIndex';

export function LvmVolumeList() {
  const LvmVolume = React.useMemo(() => lvmVolumeClass(), []);
  const pvIndex = usePvIndex();

  const columns = [
    {
      id: 'claim',
      label: 'Claim Name',
      render: (item: any) => {
        const pv = pvIndex.get(item?.metadata?.name || '');
        if (pv === undefined) return <Skeleton variant="text" width={140} />;
        const claimName = pv?.spec?.claimRef?.name;
        const ns = pv?.spec?.claimRef?.namespace;
        if (!claimName || !ns) return '';
        return (
          <ResourceLink
            routeName="persistentvolumeclaim"
            routeParams={{ namespace: ns, name: claimName }}
            name={claimName}
            resource={PersistentVolumeClaim}
          />
        );
      },
      getValue: (item: any) => {
        const pv = pvIndex.get(item?.metadata?.name || '');
        return pv?.spec?.claimRef?.name ?? '';
      },
      sort: true,
    },
    {
      id: 'claimNamespace',
      label: 'Claim Namespace',
      render: (item: any) => {
        const pv = pvIndex.get(item?.metadata?.name || '');
        if (pv === undefined) return <Skeleton variant="text" width={120} />;
        const ns = pv?.spec?.claimRef?.namespace;
        if (!ns) return '';
        return (
          <ResourceLink
            routeName="namespace"
            routeParams={{ name: ns }}
            name={ns}
            resource={Namespace}
          />
        );
      },
      getValue: (item: any) => {
        const pv = pvIndex.get(item?.metadata?.name || '');
        return pv?.spec?.claimRef?.namespace ?? '';
      },
      sort: true,
    },
    'name',
    {
      id: 'capacity',
      label: 'Capacity',
      getValue: (item: any) => formatIBytes(item?.spec?.capacity),
    },
    {
      id: 'reclaimPolicy',
      label: 'Reclaim Policy',
      render: (item: any) => {
        const pv = pvIndex.get(item?.metadata?.name || '');
        if (pv === undefined) return <Skeleton variant="text" width={80} />;
        return pv?.spec?.persistentVolumeReclaimPolicy || 'Retain';
      },
      getValue: (item: any) => {
        const pv = pvIndex.get(item?.metadata?.name || '');
        return pv?.spec?.persistentVolumeReclaimPolicy ?? '';
      },
    },
    {
      id: 'storageClass',
      label: 'Storage Class',
      render: (item: any) => {
        const pv = pvIndex.get(item?.metadata?.name || '');
        if (pv === undefined) return <Skeleton variant="text" width={100} />;
        return pv?.spec?.storageClassName || '';
      },
      getValue: (item: any) => {
        const pv = pvIndex.get(item?.metadata?.name || '');
        return pv?.spec?.storageClassName ?? '';
      },
    },
    {
      id: 'provisioner',
      label: 'Provisioner',
      render: (item: any) => {
        const pv = pvIndex.get(item?.metadata?.name || '');
        if (pv === undefined) return <Skeleton variant="text" width={140} />;
        const ann = pv?.metadata?.annotations || {};
        const provisioner = ann['pv.kubernetes.io/provisioned-by'] || '';
        const csiDriver = pv?.spec?.csi?.driver || '';
        const src = provisioner || csiDriver || '';
        return src.split('/').slice(0, 2).join('/') || src;
      },
      getValue: (item: any) => {
        const pv = pvIndex.get(item?.metadata?.name || '');
        const ann = pv?.metadata?.annotations || {};
        const provisioner = ann['pv.kubernetes.io/provisioned-by'] || '';
        const csiDriver = pv?.spec?.csi?.driver || '';
        const src = provisioner || csiDriver || '';
        return src.split('/').slice(0, 2).join('/') || src || '';
      },
    },
    'age',
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <SectionBox>
        <ResourceListView
          title="LVM Volumes"
          resourceClass={LvmVolume as any}
          columns={columns as any}
          headerProps={{ titleSideActions: [] }}
        />
      </SectionBox>
    </Box>
  );
}

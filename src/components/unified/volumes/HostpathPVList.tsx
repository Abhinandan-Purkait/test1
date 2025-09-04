import React from 'react';
import {
  SectionBox,
  ResourceListView,
  ResourceLink,
} from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Box } from '@mui/material';
import PersistentVolume from '@kinvolk/headlamp-plugin/lib/k8s/persistentVolume';
import PersistentVolumeClaim from '@kinvolk/headlamp-plugin/lib/k8s/persistentVolumeClaim';
import Namespace from '@kinvolk/headlamp-plugin/lib/k8s/namespace';
import { HOSTPATH_PROVISIONER } from '../../utils/constants';
import { formatIBytes } from '../../utils/humanize_size';

export function HostpathPVList() {
  const columns = [
    {
      id: 'claim',
      label: 'Claim Name',
      render: (item: any) => {
        const ns = item?.spec?.claimRef?.namespace;
        const name = item?.spec?.claimRef?.name;
        if (!name || !ns) return '';
        return (
          <ResourceLink
            routeName="persistentvolumeclaim"
            routeParams={{ namespace: ns, name }}
            name={name}
            resource={PersistentVolumeClaim}
          />
        );
      },
      getValue: (item: any) => item?.spec?.claimRef?.name ?? '',
      sort: true,
    },
    {
      id: 'claimNamespace',
      label: 'Claim Namespace',
      render: (item: any) => {
        const ns = item?.spec?.claimRef?.namespace;
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
      getValue: (item: any) => item?.spec?.claimRef?.namespace ?? '',
      sort: true,
    },
    'name',
    {
      id: 'capacity',
      label: 'Capacity',
      getValue: (item: any) => formatIBytes(item.spec?.capacity?.storage),
    },
    {
      id: 'reclaimPolicy',
      label: 'Reclaim Policy',
      getValue: (item: any) => item.spec?.persistentVolumeReclaimPolicy || 'Retain',
    },
    {
      id: 'storageClass',
      label: 'Storage Class',
      getValue: (item: any) => item.spec?.storageClassName || '',
    },
    {
      id: 'provisioner',
      label: 'Provisioner',
      getValue: (item: any) => {
        const ann = item.metadata?.annotations || {};
        const provisioner = ann['pv.kubernetes.io/provisioned-by'] || '';
        const csiDriver = item.spec?.csi?.driver || '';
        const src = provisioner || csiDriver || '';
        return src.split('/').slice(0, 2).join('/') || src;
      },
    },
    'age',
  ];

  const filterFunction = (pv: any) => {
    const ann = pv.metadata?.annotations || {};
    const provisioner = ann['pv.kubernetes.io/provisioned-by'] || '';
    const csiDriver = pv.spec?.csi?.driver || '';
    return HOSTPATH_PROVISIONER.some(
      allowed =>
        provisioner.toLowerCase().includes(allowed.toLowerCase()) ||
        csiDriver.toLowerCase().includes(allowed.toLowerCase()),
    );
  };

  return (
    <Box sx={{ mt: 2 }}>
      <SectionBox>
        <ResourceListView
          title="Hostpath Persistent Volumes"
          resourceClass={PersistentVolume}
          columns={columns as any}
          filterFunction={filterFunction}
          headerProps={{ titleSideActions: [] }}
        />
      </SectionBox>
    </Box>
  );
}

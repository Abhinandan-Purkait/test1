import React from 'react';
import { SectionBox, ResourceListView } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Box } from '@mui/material';
import PersistentVolume from '@kinvolk/headlamp-plugin/lib/k8s/persistentVolume';
import { MAYASTOR_PROVISIONER } from '../../utils/constants';

export function MayastorPVList() {
  const columns = [
    'name',
    {
      id: 'status',
      label: 'Status',
      getValue: (item: any) => item.status?.phase || 'Pending',
    },
    {
      id: 'claim',
      label: 'Claim',
      getValue: (item: any) => {
        const ref = item.spec?.claimRef;
        return ref ? `${ref.namespace}/${ref.name}` : '-';
      },
    },
    {
      id: 'capacity',
      label: 'Capacity',
      getValue: (item: any) => item.spec?.capacity?.storage || '-',
    },
    {
      id: 'accessModes',
      label: 'Access Modes',
      getValue: (item: any) => {
        const modes = item.spec?.accessModes || [];
        const map: Record<string, string> = {
          ReadWriteOnce: 'RWO',
          ReadOnlyMany: 'ROX',
          ReadWriteMany: 'RWX',
          ReadWriteOncePod: 'RWOP',
        };
        return modes.map((m: string) => map[m] || m).join(', ') || '-';
      },
    },
    {
      id: 'reclaimPolicy',
      label: 'Reclaim Policy',
      getValue: (item: any) => item.spec?.persistentVolumeReclaimPolicy || 'Retain',
    },
    {
      id: 'storageClass',
      label: 'Storage Class',
      getValue: (item: any) => item.spec?.storageClassName || '-',
    },
    {
      id: 'provisioner',
      label: 'Provisioner',
      getValue: (item: any) => {
        const ann = item.metadata?.annotations || {};
        const provisioner = ann['pv.kubernetes.io/provisioned-by'] || '';
        const csiDriver = item.spec?.csi?.driver || '';
        const src = provisioner || csiDriver || '-';
        return src.split('/').slice(0, 2).join('/') || src;
      },
    },
    'age',
  ];

  const filterFunction = (pv: any) => {
    const ann = pv.metadata?.annotations || {};
    const provisioner = ann['pv.kubernetes.io/provisioned-by'] || '';
    const csiDriver = pv.spec?.csi?.driver || '';
    return MAYASTOR_PROVISIONER.some((allowed) =>
      provisioner.toLowerCase().includes(allowed.toLowerCase()) ||
      csiDriver.toLowerCase().includes(allowed.toLowerCase())
    );
  };

  return (
    <Box sx={{ mt: 2 }}>
      <SectionBox>
        <ResourceListView
          title="Mayastor Persistent Volumes"
          resourceClass={PersistentVolume}
          columns={columns as any}
          filterFunction={filterFunction}
          headerProps={{ titleSideActions: [] }}
        />
      </SectionBox>
    </Box>
  );
}

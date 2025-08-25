import { ResourceListView, SectionBox } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import PersistentVolume from '@kinvolk/headlamp-plugin/lib/k8s/persistentVolume';
import { Box, Link as MuiLink } from '@mui/material';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  LVM_PROVISIONER,
  MAYASTOR_PROVISIONER,
  ZFS_PROVISIONER,
} from '../utils/constants';
import { StorageSelector, useStorageEngine } from './StorageEngineSelector';

export function UnifiedPVsList() {
  const [selectedEngine, setSelectedEngine] = useStorageEngine('mayastor');

  const columns = [
    {
      id: 'name',
      label: 'Name',
      getValue: (item: any) => item.metadata?.name ?? '-',
      render: (item: any) => {
        const name = item.metadata?.name ?? '';
        if (!name) return '-';

        const cluster = item._clusterName || item.cluster || '';
        const href = cluster
          ? `#/c/${cluster}/puls8/pvs/details`
          : '#/puls8/pvs/details';

        return (
          <MuiLink
            href={href}
            underline="hover"
            sx={{ fontWeight: 500 }}
          >
            {name}
          </MuiLink>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      getValue: (item: any) => item.status?.phase || 'Pending',
    },
    {
      id: 'claim',
      label: 'Claim',
      getValue: (item: any) => {
        const claimRef = item.spec?.claimRef;
        if (!claimRef) return '-';
        return `${claimRef.namespace}/${claimRef.name}`;
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
        const modeMap: { [key: string]: string } = {
          ReadWriteOnce: 'RWO',
          ReadOnlyMany: 'ROX',
          ReadWriteMany: 'RWX',
          ReadWriteOncePod: 'RWOP',
        };
        return modes.map((mode: string) => modeMap[mode] || mode).join(', ') || '-';
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
        const annotations = item.metadata?.annotations || {};
        const provisioner = annotations['pv.kubernetes.io/provisioned-by'] || '';
        const csiDriver = item.spec?.csi?.driver || '';
        const source = provisioner || csiDriver || '-';
        return source.split('/').slice(0, 2).join('/') || source;
      },
    },
    'age',
  ] as any;

  const getFilterFunction = () => {
    let provisionerList: string[] = [];
    switch (selectedEngine) {
      case 'mayastor':
        provisionerList = MAYASTOR_PROVISIONER;
        break;
      case 'lvm':
        provisionerList = LVM_PROVISIONER;
        break;
      case 'zfs':
        provisionerList = ZFS_PROVISIONER;
        break;
    }
    return (pv: any) => {
      const annotations = pv.metadata?.annotations || {};
      const provisioner = annotations['pv.kubernetes.io/provisioned-by'] || '';
      const csiDriver = pv.spec?.csi?.driver || '';
      return provisionerList.some(
        allowed =>
          provisioner.toLowerCase().includes(allowed.toLowerCase()) ||
          csiDriver.toLowerCase().includes(allowed.toLowerCase())
      );
    };
  };

  const getTitle = () => {
    switch (selectedEngine) {
      case 'mayastor':
        return 'Mayastor Persistent Volumes';
      case 'lvm':
        return 'LVM Persistent Volumes';
      case 'zfs':
        return 'ZFS Persistent Volumes';
      default:
        return 'Persistent Volumes';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <StorageSelector value={selectedEngine} onChange={setSelectedEngine} title="" description="" />

      <Box sx={{ mt: 2 }}>
        <SectionBox>
          <ResourceListView
            title={getTitle()}
            resourceClass={PersistentVolume}
            columns={columns}
            filterFunction={getFilterFunction()}
          />
        </SectionBox>
      </Box>

      <MuiLink component={RouterLink} to="/puls8/ping" underline="hover">
        Ping test
      </MuiLink>
    </Box>
  );
}

import { ResourceListView, SectionBox } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import PersistentVolumeClaim from '@kinvolk/headlamp-plugin/lib/k8s/persistentVolumeClaim';
import { Box } from '@mui/material';
import React from 'react';
import {
  LVM_PROVISIONER,
  MAYASTOR_PROVISIONER,
  ZFS_PROVISIONER,
} from '../utils/constants';
import { StorageSelector, useStorageEngine } from './StorageEngineSelector';

export function UnifiedPVCsList() {
  const [selectedEngine, setSelectedEngine] = useStorageEngine('mayastor');

  const columns = [
    'name',
    'namespace',
    {
      id: 'status',
      label: 'Status',
      getValue: (item: any) => item.status?.phase || 'Pending',
    },
    {
      id: 'volume',
      label: 'Volume',
      getValue: (item: any) => item.spec?.volumeName || '-',
    },
    {
      id: 'capacity',
      label: 'Capacity',
      getValue: (item: any) => item.status?.capacity?.storage || item.spec?.resources?.requests?.storage || '-',
    },
    {
      id: 'accessModes',
      label: 'Access Modes',
      getValue: (item: any) => {
        const modes = item.spec?.accessModes || [];
        const modeMap: { [key: string]: string } = {
          'ReadWriteOnce': 'RWO',
          'ReadOnlyMany': 'ROX',
          'ReadWriteMany': 'RWX',
          'ReadWriteOncePod': 'RWOP',
        };
        return modes.map((mode: string) => modeMap[mode] || mode).join(', ') || '-';
      },
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
        const provisioner = annotations['volume.kubernetes.io/storage-provisioner'] || 
                          annotations['volume.beta.kubernetes.io/storage-provisioner'] || '-';
        return provisioner.split('/').slice(0, 2).join('/') || provisioner;
      },
    },
    'age',
  ];

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

    return (pvc: any) => {
      const annotations = pvc.metadata?.annotations || {};
      const provisioner = annotations['volume.kubernetes.io/storage-provisioner'] || 
                        annotations['volume.beta.kubernetes.io/storage-provisioner'] || '';
      return provisionerList.some(allowed => 
        provisioner.toLowerCase().includes(allowed.toLowerCase())
      );
    };
  };

  const getTitle = () => {
    switch (selectedEngine) {
      case 'mayastor':
        return 'Mayastor Persistent Volume Claims';
      case 'lvm':
        return 'LVM Persistent Volume Claims';
      case 'zfs':
        return 'ZFS Persistent Volume Claims';
      default:
        return 'Persistent Volume Claims';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <StorageSelector
        value={selectedEngine}
        onChange={setSelectedEngine}
        title=""
        description=""
      />

      <Box sx={{ mt: 2 }}>
        <SectionBox>
          <ResourceListView
            title={getTitle()}
            resourceClass={PersistentVolumeClaim}
            columns={columns as any}
            filterFunction={getFilterFunction()}
          />
        </SectionBox>
      </Box>
    </Box>
  );
}

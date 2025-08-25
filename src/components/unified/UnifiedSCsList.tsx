import { ResourceListView, SectionBox } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import StorageClass from '@kinvolk/headlamp-plugin/lib/k8s/storageClass';
import { Box } from '@mui/material';
import React from 'react';
import {
  LVM_PROVISIONER,
  MAYASTOR_PROVISIONER,
  ZFS_PROVISIONER,
} from '../utils/constants';
import { StorageSelector, useStorageEngine } from './StorageEngineSelector';

export function UnifiedStorageClassesList() {
  const [selectedEngine, setSelectedEngine] = useStorageEngine('mayastor');

  const columns = [
    'name',
    {
      id: 'provisioner',
      label: 'Provisioner',
      getValue: (item: any) => item.provisioner || '-',
    },
    {
      id: 'volumeBindingMode',
      label: 'Volume Binding Mode',
      getValue: (item: any) => item.volumeBindingMode || 'Immediate',
    },
    {
      id: 'reclaimPolicy',
      label: 'Reclaim Policy',
      getValue: (item: any) => item.reclaimPolicy || 'Delete',
    },
    {
      id: 'allowVolumeExpansion',
      label: 'Allow Expansion',
      getValue: (item: any) => item.allowVolumeExpansion ? 'Yes' : 'No',
    },
    {
      id: 'default',
      label: 'Default',
      getValue: (item: any) => {
        const annotations = item.metadata?.annotations || {};
        return annotations['storageclass.kubernetes.io/is-default-class'] === 'true' ? 'Yes' : 'No';
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

    return (sc: any) => {
      const provisioner = sc.provisioner || '';
      return provisionerList.some(allowed => 
        provisioner.toLowerCase().includes(allowed.toLowerCase())
      );
    };
  };

  const getTitle = () => {
    switch (selectedEngine) {
      case 'mayastor':
        return 'Mayastor Storage Classes';
      case 'lvm':
        return 'LVM Storage Classes';
      case 'zfs':
        return 'ZFS Storage Classes';
      default:
        return 'Storage Classes';
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
            resourceClass={StorageClass}
            columns={columns as any}
            filterFunction={getFilterFunction()}
          />
        </SectionBox>
      </Box>
    </Box>
  );
}

import { ResourceListView, SectionBox } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Box } from '@mui/material';
import React from 'react';
import { volumeSnapshotClassClass } from '../../resources/volumesnapshotclass';
import { LVM_PROVISIONER, MAYASTOR_PROVISIONER, ZFS_PROVISIONER } from '../utils/constants';
import { StorageSelector, useStorageEngine } from './StorageEngineSelector';

export function UnifiedVolumeSnapshotClassesList() {
  const [selectedEngine, setSelectedEngine] = useStorageEngine('mayastor');

  const columns = [
    'name',
    {
      id: 'driver',
      label: 'Driver',
      getValue: (item: any) => item.jsonData.driver || '-',
    },
    {
      id: 'deletionPolicy',
      label: 'Deletion Policy',
      getValue: (item: any) => item.jsonData.deletionPolicy || 'Delete',
    },
    {
      id: 'parameters',
      label: 'Parameters',
      getValue: (item: any) => {
        const params = item.jsonData.parameters || {};
        const count = Object.keys(params).length;
        return count > 0 ? `${count} parameter(s)` : 'None';
      },
    },
    {
      id: 'default',
      label: 'Default',
      getValue: (item: any) => {
        const annotations = item.metadata?.annotations || {};
        return annotations['snapshot.storage.kubernetes.io/is-default-class'] === 'true'
          ? 'Yes'
          : 'No';
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

    return (vsc: any) => {
      const driver = vsc.jsonData.driver || '';
      return provisionerList.some(allowed => driver.toLowerCase().includes(allowed.toLowerCase()));
    };
  };

  const getTitle = () => {
    switch (selectedEngine) {
      case 'mayastor':
        return 'Mayastor Volume Snapshot Classes';
      case 'lvm':
        return 'LVM Volume Snapshot Classes';
      case 'zfs':
        return 'ZFS Volume Snapshot Classes';
      default:
        return 'Volume Snapshot Classes';
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
            resourceClass={volumeSnapshotClassClass()}
            columns={columns as any}
            filterFunction={getFilterFunction()}
          />
        </SectionBox>
      </Box>
    </Box>
  );
}

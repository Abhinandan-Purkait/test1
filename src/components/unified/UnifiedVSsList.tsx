import { ResourceListView, SectionBox } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { volumeSnapshotClass } from '../../resources/volumesnapshot';
import { volumeSnapshotClassClass } from '../../resources/volumesnapshotclass';
import { LVM_PROVISIONER, MAYASTOR_PROVISIONER, ZFS_PROVISIONER } from '../utils/constants';
import { StorageSelector, useStorageEngine } from './StorageEngineSelector';

export function UnifiedVolumeSnapshotsList() {
  const [selectedEngine, setSelectedEngine] = useStorageEngine('mayastor');
  const [validClasses, setValidClasses] = useState<string[]>([]);

  const getCurrentProvisionerList = () => {
    switch (selectedEngine) {
      case 'mayastor':
        return MAYASTOR_PROVISIONER;
      case 'lvm':
        return LVM_PROVISIONER;
      case 'zfs':
        return ZFS_PROVISIONER;
      default:
        return MAYASTOR_PROVISIONER;
    }
  };

  useEffect(() => {
    const SnapshotClassCls = volumeSnapshotClassClass();
    const fetchClasses = SnapshotClassCls.apiList(
      classes => {
        const provisionerList = getCurrentProvisionerList();
        const valid = classes
          .filter(c => {
            const driver = c.jsonData.driver || '';
            return provisionerList.some(allowed =>
              driver.toLowerCase().includes(allowed.toLowerCase()),
            );
          })
          .map(c => c.jsonData.metadata.name);
        setValidClasses(valid);
      },
      err => {
        console.error('Error fetching VolumeSnapshotClasses:', err);
        setValidClasses([]);
      },
    );
    const unsubscribePromise = fetchClasses();
    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, [selectedEngine]);

  const columns = [
    'name',
    'namespace',
    {
      id: 'readyToUse',
      label: 'Ready',
      getValue: (item: any) => (item.jsonData.status?.readyToUse ? 'Yes' : 'No'),
    },
    {
      id: 'sourcePVC',
      label: 'Source PVC',
      getValue: (item: any) => item.jsonData.spec?.source?.persistentVolumeClaimName || '-',
    },
    {
      id: 'restoreSize',
      label: 'Restore Size',
      getValue: (item: any) => item.jsonData.status?.restoreSize || '-',
    },
    {
      id: 'snapshotClass',
      label: 'Snapshot Class',
      getValue: (item: any) => item.jsonData.spec?.volumeSnapshotClassName || '-',
    },
    {
      id: 'creationTime',
      label: 'Creation Time',
      getValue: (item: any) => {
        const creationTime = item.jsonData.status?.creationTime;
        if (!creationTime) return '-';
        return new Date(creationTime).toLocaleString();
      },
    },
    'age',
  ];

  const getTitle = () => {
    switch (selectedEngine) {
      case 'mayastor':
        return 'Mayastor Volume Snapshots';
      case 'lvm':
        return 'LVM Volume Snapshots';
      case 'zfs':
        return 'ZFS Volume Snapshots';
      default:
        return 'Volume Snapshots';
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
            resourceClass={volumeSnapshotClass()}
            filterFunction={(vs: any) =>
              validClasses.includes(vs.jsonData.spec?.volumeSnapshotClassName)
            }
            columns={columns as any}
          />
        </SectionBox>
      </Box>
    </Box>
  );
}

import { SectionBox } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Box } from '@mui/material';
import React from 'react';
import { LVMVolumeGroups, MayastorDiskPools, ZFSPools } from './storagepools';
import { StorageSelector, useStorageEngine } from './StorageEngineSelector';

export function UnifiedStoragePools() {
  const [selectedEngine, setSelectedEngine] = useStorageEngine('mayastor');

  const renderPoolComponent = () => {
    switch (selectedEngine) {
      case 'mayastor':
        return <MayastorDiskPools />;
      case 'lvm':
        return <LVMVolumeGroups />;
      case 'zfs':
        return <ZFSPools />;
      default:
        return null;
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
          {renderPoolComponent()}
        </SectionBox>
      </Box>
    </Box>
  );
}

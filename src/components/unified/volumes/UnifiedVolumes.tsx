import React from 'react';
import { Box } from '@mui/material';
import { StorageSelector, useStorageEngine } from '../StorageEngineSelector';
import { MayastorPVList } from './MayastorPVList';
import { LvmVolumeList } from './LVMVolumeList';
import { ZfsVolumeList } from './ZFSVolumeList';

export function UnifiedVolumes() {
  const [selectedEngine, setSelectedEngine] = useStorageEngine('mayastor');

  return (
    <Box sx={{ p: 3 }}>
      <StorageSelector
        value={selectedEngine}
        onChange={setSelectedEngine}
        title=""
        description=""
      />
      {selectedEngine === 'mayastor' && <MayastorPVList />}
      {selectedEngine === 'lvm' && <LvmVolumeList />}
      {selectedEngine === 'zfs' && <ZfsVolumeList />}
    </Box>
  );
}

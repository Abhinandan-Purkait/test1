import React from 'react';
import { Box } from '@mui/material';
import { StorageSelector, useStorageEngine } from '../StorageEngineSelector';
import { MayastorPVList } from './MayastorPVList';
import { LvmVolumeList } from './LVMVolumeList';
import { ZfsVolumeList } from './ZFSVolumeList';
import { HostpathPVList } from './HostpathPVList';

export function UnifiedVolumes() {
  const [selectedEngine, setSelectedEngine] =useStorageEngine({
    defaultEngine: 'mayastor',
    variants: ['mayastor', 'lvm', 'zfs', 'hostpath'],
  });

  return (
    <Box sx={{ p: 3 }}>
      <StorageSelector
        value={selectedEngine}
        onChange={setSelectedEngine}
        title=""
        description=""
        variants={['mayastor', 'lvm', 'zfs', 'hostpath']}
      />
      {selectedEngine === 'mayastor' && <MayastorPVList />}
      {selectedEngine === 'lvm' && <LvmVolumeList />}
      {selectedEngine === 'zfs' && <ZfsVolumeList />}
      {selectedEngine === 'hostpath' && <HostpathPVList />}
    </Box>
  );
}

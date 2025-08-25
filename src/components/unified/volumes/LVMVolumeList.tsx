import React from 'react';
import { SectionBox, ResourceListView } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Box } from '@mui/material';
import { lvmVolumeClass } from '../../../resources/lvmvolume';

export function LvmVolumeList() {
  const LvmVolume = React.useMemo(() => lvmVolumeClass(), []);

  const columns = [
    'name',
    {
      id: 'namespace',
      label: 'Namespace',
      getValue: (item: any) => item.metadata?.namespace ?? '-',
    },
    {
      id: 'capacity',
      label: 'Capacity',
      getValue: (item: any) => item.spec?.capacity ?? '-',
    },
    {
      id: 'ownerNodeID',
      label: 'Owner Node',
      getValue: (item: any) => item.spec?.ownerNodeID ?? '-',
    },
    {
      id: 'volGroup',
      label: 'VolGroup',
      getValue: (item: any) => item.spec?.volGroup ?? '-',
    },
    {
      id: 'state',
      label: 'State',
      getValue: (item: any) => item.status?.state ?? '-',
    },
    'age',
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <SectionBox>
        <ResourceListView
          title="LVM Volumes"
          resourceClass={LvmVolume as any}
          columns={columns as any}
          headerProps={{ titleSideActions: [] }}
        />
      </SectionBox>
    </Box>
  );
}

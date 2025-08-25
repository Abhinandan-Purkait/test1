import React from 'react';
import { Box } from '@mui/material';
import {
  DetailsGrid,
  SectionBox,
  ResourceListView,
} from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { useParams } from 'react-router-dom';
import { zfsVolumeClass } from '../../../resources/zfsvolume';
import PersistentVolume from '@kinvolk/headlamp-plugin/lib/k8s/persistentVolume';

export function ZFSVolumeDetails() {
  const { name, namespace } = useParams<{ name: string; namespace: string }>();
  const ZfsVolume = React.useMemo(() => zfsVolumeClass(), []);

  const pvFilter = React.useCallback(
    (pv: any) => (name ? pv?.metadata?.name === name : false),
    [name]
  );

  return (
    <Box sx={{ p: 3 }}>
      <SectionBox>
        <DetailsGrid
          resourceType={ZfsVolume as any}
          name={name}
          namespace={namespace}
          withEvents
          extraInfo={item =>
            item && [
              { name: 'Namespace', value: item.metadata?.namespace ?? '-' },
              { name: 'Pool', value: item.spec?.poolName ?? '-' },
              { name: 'Owner Node', value: item.spec?.ownerNodeID ?? '-' },
              { name: 'Capacity', value: item.spec?.capacity ?? '-' },
              { name: 'Dedup', value: item.spec?.dedup ?? '-' },
              { name: 'Compression', value: item.spec?.compression ?? '-' },
              { name: 'Dedup', value: item.spec?.dedup ?? '-' },
              { name: 'Encryption', value: item.spec?.encryption ?? '-' },
              { name: 'FS Type', value: item.spec?.fsType ?? '-' },
              { name: 'Quota Type', value: item.spec?.quotaType ?? '-' },
              { name: 'Volume Type', value: item.spec?.volumeType ?? '-' },
              { name: 'Volume Block Size', value: item.spec?.volblocksize ?? '-' },
              { name: 'Thin Provisioing', value: item.spec?.thinProvision ?? '-' },
              { name: 'Record Size', value: item.spec?.recordsize ?? '-' },
              { name: 'State', value: item.status?.state ?? 'Unknown' },
            ]
          }
        />
      </SectionBox>
      <ResourceListView
        title="Associated Persistent Volume"
        resourceClass={PersistentVolume}
        headerProps={{ titleSideActions: [] }}
        columns={[
          'name',
          {
            id: 'storageClass',
            label: 'Storage Class',
            getValue: item => item.spec.storageClassName,
          },
          {
            id: 'phase',
            label: 'Phase',
            getValue: item => item.status.phase,
          },
          {
            id: 'accessModes',
            label: 'Access Modes',
            getValue: item => item.spec?.accessModes?.join(', ')
          },
          {
            id: 'capacity',
            label: 'Capacity',
            getValue: item => item.spec?.capacity?.storage
          },
          {
            id: 'claim',
            label: 'Claim',
            getValue: item => {
              const ref = item.spec?.claimRef;
              return ref ? `${ref.namespace}/${ref.name}` : '-';
            }
          },
          {
            id: 'reclaimPolicy',
            label: 'Reclaim Policy',
            getValue: item => item.spec?.persistentVolumeReclaimPolicy
          },
          'age',
        ]}
        filterFunction={pvFilter}
      />
    </Box>
  );
}

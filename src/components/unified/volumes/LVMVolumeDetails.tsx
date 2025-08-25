import React from 'react';
import { Box } from '@mui/material';
import {
  DetailsGrid,
  SectionBox,
  ResourceListView,
} from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { useParams } from 'react-router-dom';
import { lvmVolumeClass } from '../../../resources/lvmvolume';
import PersistentVolume from '@kinvolk/headlamp-plugin/lib/k8s/persistentVolume';

export function LVMVolumeDetails() {
  const { name, namespace } = useParams<{ name: string; namespace: string }>();
  const LvmVolume = React.useMemo(() => lvmVolumeClass(), []);

  const pvFilter = React.useCallback(
    (pv: any) => (name ? pv?.metadata?.name === name : false),
    [name]
  );

  return (
    <Box sx={{ p: 3 }}>
      <SectionBox>
        <DetailsGrid
          resourceType={LvmVolume as any}
          name={name}
          namespace={namespace}
          withEvents
          extraInfo={item =>
            item && [
              { name: 'Namespace', value: item.metadata?.namespace ?? '-' },
              { name: 'VolGroup', value: item.spec?.volGroup ?? '-' },
              { name: 'Owner Node', value: item.spec?.ownerNodeID ?? '-' },
              { name: 'Capacity', value: item.spec?.capacity ?? '-' },
              { name: 'Shared', value: item.spec?.shared ?? '-' },
              { name: 'Thin Provision', value: item.spec?.thinProvision ?? '-' },
              { name: 'State', value: item.status?.state ?? 'Unknown' },
            ]
          }
        />
      </SectionBox>
      <ResourceListView
        title="Associated Persistent Volume"
        headerProps={{ titleSideActions: [] }}
        resourceClass={PersistentVolume}
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

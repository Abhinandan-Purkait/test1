import React from 'react';
import { Box } from '@mui/material';
import {
  DetailsGrid,
  SectionBox,
  ResourceListView,
  ResourceLink,
} from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { useParams } from 'react-router-dom';
import { zfsVolumeClass } from '../../../resources/zfsvolume';
import PersistentVolume from '@kinvolk/headlamp-plugin/lib/k8s/persistentVolume';
import PersistentVolumeClaim from '@kinvolk/headlamp-plugin/lib/k8s/persistentVolumeClaim';
import Namespace from '@kinvolk/headlamp-plugin/lib/k8s/namespace';
import { formatIBytes } from '../../utils/humanize_size';

export function ZFSVolumeDetails() {
  const { name, namespace } = useParams<{ name: string; namespace: string }>();
  const ZfsVolume = React.useMemo(() => zfsVolumeClass(), []);

  const pvFilter = React.useCallback(
    (pv: any) => (name ? pv?.metadata?.name === name : false),
    [name],
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
              { name: 'Namespace', value: item.metadata?.namespace ?? '' },
              { name: 'Pool', value: item.spec?.poolName ?? '' },
              { name: 'Owner Node', value: item.spec?.ownerNodeID ?? '' },
              { name: 'Capacity', value: formatIBytes(item.spec?.capacity) },
              { name: 'Dedup', value: item.spec?.dedup ?? '' },
              { name: 'Compression', value: item.spec?.compression ?? '' },
              { name: 'Dedup', value: item.spec?.dedup ?? '' },
              { name: 'Encryption', value: item.spec?.encryption ?? '' },
              { name: 'FS Type', value: item.spec?.fsType ?? '' },
              { name: 'Quota Type', value: item.spec?.quotaType ?? '' },
              { name: 'Volume Type', value: item.spec?.volumeType ?? '' },
              { name: 'Volume Block Size', value: formatIBytes(item.spec?.volblocksize) },
              { name: 'Thin Provisioing', value: item.spec?.thinProvision ?? '' },
              { name: 'Record Size', value: formatIBytes(item.spec?.recordsize) },
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
          {
            id: 'claim',
            label: 'Claim Name',
            render: (item: any) => {
              const ns = item?.spec?.claimRef?.namespace;
              const name = item?.spec?.claimRef?.name;
              if (!name || !ns) return '';
              return (
                <ResourceLink
                  routeName="persistentvolumeclaim"
                  routeParams={{ namespace: ns, name }}
                  name={name}
                  resource={PersistentVolumeClaim}
                />
              );
            },
            getValue: (item: any) => item?.spec?.claimRef?.name ?? '',
            sort: true,
          },
          {
            id: 'claimNamespace',
            label: 'Claim Namespace',
            render: (item: any) => {
              const ns = item?.spec?.claimRef?.namespace;
              if (!ns) return '';
              return (
                <ResourceLink
                  routeName="namespace"
                  routeParams={{ name: ns }}
                  name={ns}
                  resource={Namespace}
                />
              );
            },
            getValue: (item: any) => item?.spec?.claimRef?.namespace ?? '',
            sort: true,
          },
          'name',
          {
            id: 'capacity',
            label: 'Capacity',
            getValue: (item: any) => formatIBytes(item.spec?.capacity?.storage),
          },
          {
            id: 'reclaimPolicy',
            label: 'Reclaim Policy',
            getValue: (item: any) => item.spec?.persistentVolumeReclaimPolicy || 'Retain',
          },
          {
            id: 'storageClass',
            label: 'Storage Class',
            getValue: (item: any) => item.spec?.storageClassName || '',
          },
          {
            id: 'provisioner',
            label: 'Provisioner',
            getValue: (item: any) => {
              const ann = item.metadata?.annotations || {};
              const provisioner = ann['pv.kubernetes.io/provisioned-by'] || '';
              const csiDriver = item.spec?.csi?.driver || '';
              const src = provisioner || csiDriver || '';
              return src.split('/').slice(0, 2).join('/') || src;
            },
          },
          'age',
        ]}
        filterFunction={pvFilter}
      />
    </Box>
  );
}

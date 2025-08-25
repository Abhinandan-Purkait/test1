import { DetailsGrid, SectionBox } from '@kinvolk/headlamp-plugin/lib/components/common';
import React from 'react';
import { useParams } from 'react-router-dom';
import { volumeSnapshotClass } from '../../resources/volumesnapshot';

export function VolumeSnapshotDetail() {
  const { name, namespace } = useParams<{ name: string; namespace: string }>();

  return (
    <SectionBox title="Volume Snapshot Details">
      <DetailsGrid
        resourceType={volumeSnapshotClass()}
        name={name}
        namespace={namespace}
        withEvents
        extraInfo={item =>
          item && [
            { name: 'Ready to Use', value: item.jsonData.status?.readyToUse ? 'Yes' : 'No' },
            { name: 'Source PVC', value: item.jsonData.spec?.source?.persistentVolumeClaimName || '-' },
            { name: 'Restore Size', value: item.jsonData.status?.restoreSize || '-' },
            { name: 'Snapshot Class', value: item.jsonData.spec?.volumeSnapshotClassName || '-' },
            { 
              name: 'Creation Time', 
              value: item.jsonData.status?.creationTime 
                ? new Date(item.jsonData.status.creationTime).toLocaleString() 
                : '-' 
            },
          ]
        }
      />
    </SectionBox>
  );
}

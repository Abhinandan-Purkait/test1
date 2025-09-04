import {
  DetailsGrid,
  NameValueTable,
  SectionBox,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import React from 'react';
import { useParams } from 'react-router-dom';
import { volumeSnapshotClassClass } from '../../resources/volumesnapshotclass';

export function VolumeSnapshotClassDetail() {
  const { name } = useParams<{ name: string }>();

  return (
    <SectionBox title="Volume Snapshot Class Details">
      <DetailsGrid
        resourceType={volumeSnapshotClassClass()}
        name={name}
        withEvents
        extraInfo={item =>
          item && [
            { name: 'Driver', value: item.jsonData.driver || '-' },
            { name: 'Deletion Policy', value: item.jsonData.deletionPolicy || '-' },
          ]
        }
        extraSections={item =>
          item &&
          item.jsonData.parameters &&
          Object.keys(item.jsonData.parameters).length > 0 && [
            {
              id: 'parameters',
              section: (
                <SectionBox title="Parameters">
                  <NameValueTable
                    rows={Object.entries(item.jsonData.parameters).map(([key, value]) => ({
                      name: key,
                      value: value as React.ReactNode,
                    }))}
                  />
                </SectionBox>
              ),
            },
          ]
        }
      />
    </SectionBox>
  );
}

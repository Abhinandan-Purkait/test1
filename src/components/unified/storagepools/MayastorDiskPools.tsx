import { ResourceListView } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import React from 'react';
import { diskPoolClass } from '../../../resources/diskpool';
import { formatIBytes } from '../../utils/humanize_size';

export function MayastorDiskPools() {
  return (
    <ResourceListView
      title="Disk Pools"
      resourceClass={diskPoolClass()}
      headerProps={{
        actions: [],
        noNamespaceFilter: true,
      }}
      enableRowSelection={false}
      actions={[]}
      columns={
        [
          'name',
          'namespace',
          {
            id: 'node',
            label: 'Node',
            getValue: (item: any) => item.jsonData.spec?.node || '',
          },
          {
            id: 'disks',
            label: 'Disks',
            getValue: (item: any) => item.jsonData.spec?.disks?.join(', ') || '',
          },
          {
            id: 'status',
            label: 'Status',
            getValue: (item: any) => item.jsonData.status?.pool_status || 'Unknown',
          },
          {
            id: 'capacity',
            label: 'Capacity',
            getValue: (item: any) => formatIBytes(item.jsonData.status?.capacity),
          },
          {
            id: 'used',
            label: 'Used',
            getValue: (item: any) => formatIBytes(item.jsonData.status?.used),
          },
          {
            id: 'available',
            label: 'Available',
            getValue: (item: any) => formatIBytes(item.jsonData.status?.available),
          },
          'age',
        ] as any
      }
    />
  );
}

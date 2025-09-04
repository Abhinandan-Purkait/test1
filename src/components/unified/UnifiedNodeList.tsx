import { ResourceListView, SectionBox } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import Node from '@kinvolk/headlamp-plugin/lib/k8s/node';
import { Box } from '@mui/material';
import React from 'react';
import {
  LVM_NODE_DAEMONSET_LABEL,
  MAYASTOR_CSI_DAEMONSET_LABEL,
  MAYASTOR_DAEMONSET_LABEL,
  ZFS_NODE_DAEMONSET_LABEL,
} from '../utils/constants';
import { createNodeFilter, useDaemonSetNodes } from '../utils/filterCreator';
import { StorageSelector, useStorageEngine } from './StorageEngineSelector';

export function UnifiedNodesList() {
  const [selectedEngine, setSelectedEngine] = useStorageEngine('mayastor');

  const { nodeNames: mayastorStorageNodes } = useDaemonSetNodes(MAYASTOR_DAEMONSET_LABEL);
  const { nodeNames: mayastorAppNodes } = useDaemonSetNodes(MAYASTOR_CSI_DAEMONSET_LABEL);
  const { nodeNames: lvmNodes } = useDaemonSetNodes(LVM_NODE_DAEMONSET_LABEL);
  const { nodeNames: zfsNodes } = useDaemonSetNodes(ZFS_NODE_DAEMONSET_LABEL);

  const baseColumns = [
    'name',
    {
      id: 'status',
      label: 'Status',
      getValue: (item: any) => {
        const conditions = item.status?.conditions || [];
        const readyCondition = conditions.find((c: any) => c.type === 'Ready');
        return readyCondition?.status === 'True' ? 'Ready' : 'Not Ready';
      },
    },
    {
      id: 'k8s-version',
      label: 'K8s Version',
      getValue: (item: any) => item.status?.nodeInfo?.kubeletVersion || '-',
    },
    {
      id: 'kernel-version',
      label: 'Kernel Version',
      getValue: (item: any) => item.status?.nodeInfo?.kernelVersion || '-',
    },
    {
      id: 'os',
      label: 'OS',
      getValue: (item: any) => item.status?.nodeInfo?.osImage || '-',
    },
    {
      id: 'allocatable-cpu',
      label: 'Allocatable CPU',
      getValue: (item: any) => item.status?.allocatable?.cpu || '-',
    },
    {
      id: 'allocatable-memory',
      label: 'Allocatable Memory',
      getValue: (item: any) => item.status?.allocatable?.memory || '-',
    },
  ];

  const mayastorColumns = [
    ...baseColumns,
    {
      id: 'allocatable-hugepages',
      label: 'Allocatable Hugepages',
      getValue: (item: any) =>
        item.status?.allocatable?.['hugepages-2Mi'] ||
        item.status?.allocatable?.['hugepages-1Gi'] ||
        '-',
    },
    'age',
  ];

  const standardColumns = [...baseColumns, 'age'];

  const getEngineConfig = () => {
    switch (selectedEngine) {
      case 'mayastor':
        return {
          storageFilter: createNodeFilter(mayastorStorageNodes),
          appFilter: createNodeFilter(mayastorAppNodes),
          columns: mayastorColumns,
          showSeparateAppNodes: true,
          title: 'Mayastor',
        };
      case 'lvm':
        return {
          storageFilter: createNodeFilter(lvmNodes),
          columns: standardColumns,
          showSeparateAppNodes: false,
          title: 'LVM',
        };
      case 'zfs':
        return {
          storageFilter: createNodeFilter(zfsNodes),
          columns: standardColumns,
          showSeparateAppNodes: false,
          title: 'ZFS',
        };
      default:
        return {
          storageFilter: () => false,
          columns: standardColumns,
          showSeparateAppNodes: false,
          title: '',
        };
    }
  };

  const config = getEngineConfig();

  return (
    <Box sx={{ p: 3 }}>
      <StorageSelector
        value={selectedEngine}
        onChange={setSelectedEngine}
        title=""
        description=""
      />

      <Box sx={{ mt: 2 }}>
        {config.showSeparateAppNodes ? (
          <>
            <SectionBox>
              <ResourceListView
                title={`${config.title} Storage Nodes`}
                resourceClass={Node}
                columns={config.columns as any}
                filterFunction={config.storageFilter}
              />
            </SectionBox>
            <SectionBox sx={{ mt: 2 }}>
              <ResourceListView
                title={`${config.title} Application Nodes`}
                resourceClass={Node}
                columns={config.columns as any}
                filterFunction={config.appFilter!}
              />
            </SectionBox>
          </>
        ) : (
          <SectionBox>
            <ResourceListView
              title={`${config.title} Storage Nodes/Application Nodes`}
              resourceClass={Node}
              columns={config.columns as any}
              filterFunction={config.storageFilter}
            />
          </SectionBox>
        )}
      </Box>
    </Box>
  );
}

import { Link } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { lvmNodeClass } from '../../../resources/lvmnode';

interface VolumeGroup {
  name: string;
  node: string;
  namespace: string;
  free: string;
  size: string;
  freeBytes: number;
  sizeBytes: number;
  usedBytes: number;
  usagePercent: number;
  uuid: string;
}

const parseSize = (size: string): number => {
  const match = size.match(/(\d+)(\w+)/);
  if (!match) return 0;
  const num = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  if (unit === 'b') return num;
  if (unit === 'ki' || unit === 'kib') return num * 1024;
  if (unit === 'mi' || unit === 'mib') return num * 1024 * 1024;
  if (unit === 'gi' || unit === 'gib') return num * 1024 * 1024 * 1024;
  if (unit === 'ti' || unit === 'tib') return num * 1024 * 1024 * 1024 * 1024;
  return 0;
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getUsageColor = (percent: number): string => {
  if (percent > 80) return 'error';
  if (percent > 60) return 'warning';
  return 'success';
};

export function LVMVolumeGroups() {
  const [volumeGroups, setVolumeGroups] = useState<VolumeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const LVMNode = lvmNodeClass();
    const fetchVolumeGroups = LVMNode.apiList(
      (nodes: any[]) => {
        try {
          const allVgs: VolumeGroup[] = [];

          nodes.forEach(node => {
            const nodeName = node?.metadata?.name || 'unknown';
            const namespace = node?.metadata?.namespace || 'default';

            let vgsData = node?.volumeGroups || node?.jsonData?.volumeGroups || node?.spec?.volumeGroups || [];

            if (vgsData && Array.isArray(vgsData)) {
              vgsData.forEach((vg: any) => {
                const freeBytes = parseSize(vg?.free || '0');
                const sizeBytes = parseSize(vg?.size || '0');
                const usedBytes = sizeBytes - freeBytes;
                const usagePercent = sizeBytes > 0 ? Math.round((usedBytes / sizeBytes) * 100) : 0;

                allVgs.push({
                  name: vg?.name || 'unnamed',
                  node: nodeName,
                  namespace: namespace,
                  free: formatBytes(freeBytes),
                  size: formatBytes(sizeBytes),
                  freeBytes: freeBytes,
                  sizeBytes: sizeBytes,
                  usedBytes: usedBytes,
                  usagePercent: usagePercent,
                  uuid: vg?.uuid || 'no-uuid'
                });
              });
            }
          });

          setVolumeGroups(allVgs);
          setLoading(false);
        } catch (err) {
          setError(`Processing error: ${err}`);
          setLoading(false);
        }
      },
      (err: any) => {
        setError(`API error: ${err?.message || err}`);
        setLoading(false);
      }
    );

    const unsubscribePromise = fetchVolumeGroups();

    return () => {
      unsubscribePromise.then((unsubscribe: any) => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe();
        }
      }).catch(() => { });
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (volumeGroups.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          LVM Volume Groups
        </Typography>
        <Typography color="text.secondary">
          No volume groups found. Check if LVMNode CRs exist and have volumeGroups defined.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 8, mt: 2, ml: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          LVM Volume Groups
        </Typography>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 1, ml: 2 }}>
        <Table size="small" sx={{
          '& thead tr': {
            backgroundColor: '#faf9f8c0',
          },
          '& thead th': {
            color: '#333',
            fontWeight: 'bold',
          },
        }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Volume Group Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Node</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Namespace</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Used</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Free</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {volumeGroups.map((vg, index) => (
              <TableRow
                key={`${vg.namespace}-${vg.node}-${vg.name}-${index}`}
                hover
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>
                  <Link
                    routeName="vg-detail"
                    params={{
                      namespace: vg.namespace,
                      node: vg.node,
                      vg: vg.name,
                    }}
                  >
                    {vg.name}
                  </Link>
                </TableCell>
                <TableCell>{vg.node}</TableCell>
                <TableCell>{vg.namespace}</TableCell>
                <TableCell>{vg.size}</TableCell>
                <TableCell>{formatBytes(vg.usedBytes)}</TableCell>
                <TableCell>{vg.free}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

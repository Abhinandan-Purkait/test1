import { Link } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { zfsNodeClass } from '../../../resources/zfsnode';
import { formatIBytes } from '../../utils/humanize_size';

interface ZPool {
  name: string;
  node: string;
  namespace: string;
  free: string;
  used: string;
  total: string;
  freeBytes: number;
  usedBytes: number;
  totalBytes: number;
  usagePercent: number;
  uuid: string;
}

export function ZFSPools() {
  const [pools, setPools] = useState<ZPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const ZFSNode = zfsNodeClass();

    const fetchZFSNodes = ZFSNode.apiList(
      (nodes: any[]) => {
        try {
          const allPools: ZPool[] = [];

          nodes.forEach(node => {
            const nodeName = node?.metadata?.name || 'unknown';
            const namespace = node?.metadata?.namespace || 'default';

            let poolsData = node?.pools || node?.jsonData?.pools || node?.spec?.pools || [];

            if (poolsData && Array.isArray(poolsData)) {
              poolsData.forEach((pool: any) => {
                const freeBytes = parseInt(pool?.free || '0');
                const usedBytes = parseInt(pool?.used || '0');
                const totalBytes = freeBytes + usedBytes;
                const usagePercent =
                  totalBytes > 0 ? Math.round((usedBytes / totalBytes) * 100) : 0;

                allPools.push({
                  name: pool?.name || 'unnamed',
                  node: nodeName,
                  namespace: namespace,
                  free: formatIBytes(freeBytes),
                  used: formatIBytes(usedBytes),
                  total: formatIBytes(totalBytes),
                  freeBytes: freeBytes,
                  usedBytes: usedBytes,
                  totalBytes: totalBytes,
                  usagePercent: usagePercent,
                  uuid: pool?.uuid || 'no-uuid',
                });
              });
            }
          });

          setPools(allPools);
          setLoading(false);
        } catch (err) {
          setError(`Processing error: ${err}`);
          setLoading(false);
        }
      },
      (err: any) => {
        setError(`API error: ${err?.message || err}`);
        setLoading(false);
      },
    );

    const unsubscribePromise = fetchZFSNodes();

    return () => {
      unsubscribePromise
        .then((unsubscribe: any) => {
          if (unsubscribe && typeof unsubscribe === 'function') {
            unsubscribe();
          }
        })
        .catch(() => {});
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

  if (pools.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          ZFS Pools
        </Typography>
        <Typography color="text.secondary">
          No pools found. Check if ZFSNode CRs exist and have pools defined.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          mb: 8,
          mt: 2,
          ml: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          ZFS Pools
        </Typography>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 1, ml: 2 }}>
        <Table
          size="small"
          sx={{
            '& thead tr': {
              backgroundColor: '#faf9f8c0',
            },
            '& thead th': {
              color: '#333',
              fontWeight: 'bold',
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Pool Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Node</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Namespace</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Used</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Free</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pools.map((pool, index) => (
              <TableRow
                key={`${pool.namespace}-${pool.node}-${pool.name}-${index}`}
                hover
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>
                  <Link
                    routeName="zpool-detail"
                    params={{
                      namespace: pool.namespace,
                      node: pool.node,
                      pool: pool.name,
                    }}
                  >
                    {pool.name}
                  </Link>
                </TableCell>
                <TableCell>{pool.node}</TableCell>
                <TableCell>{pool.namespace}</TableCell>
                <TableCell>{pool.total}</TableCell>
                <TableCell>{pool.used}</TableCell>
                <TableCell>{pool.free}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { useHistory, useParams } from 'react-router-dom';
import { diskPoolClass } from '../../../resources/diskpool';

const parseNum = (n: any): number => {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
};

const formatBytes = (bytes: number): string => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export function DiskPoolDetail() {
  const { name, namespace } = useParams<{ name: string; namespace: string }>();
  const [pool, setPool] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();

  useEffect(() => {
    const DiskPool = diskPoolClass();
    const run = DiskPool.apiGet(
      (res: any) => {
        if (!res) {
          setError(`DiskPool ${name} not found in ${namespace}`);
        } else {
          setPool(res.jsonData ?? res);
        }
        setLoading(false);
      },
      name,
      namespace,
      (err: any) => {
        setError(`Error loading DiskPool: ${err?.message || 'Unknown error'}`);
        setLoading(false);
      }
    );

    const unsubPromise = run();
    return () => {
      unsubPromise.then(unsub => unsub && unsub());
    };
  }, [name, namespace]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading DiskPool Details...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!pool) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No DiskPool data available.</Typography>
      </Box>
    );
  }

  const cap = parseNum(pool.status?.capacity);
  const used = parseNum(pool.status?.used);
  const avail = parseNum(pool.status?.available);

  const capDisp = cap ? formatBytes(cap) : pool.status?.capacity_q ?? '-';
  const usedDisp = used ? formatBytes(used) : pool.status?.used_q ?? '-';
  const availDisp = avail ? formatBytes(avail) : pool.status?.available_q ?? '-';

  const usagePct =
    cap > 0 && used >= 0 ? Math.min(100, Math.max(0, Math.round((used / cap) * 100))) : undefined;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Button onClick={() => history.goBack()} sx={{ mb: 2 }} variant="text">
          ← Back
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 500 }}>
            DiskPool: {pool.metadata?.name}
          </Typography>
        </Box>

        <Typography color="text.secondary">
          Node: {pool?.spec?.node ?? '-'} • Namespace: {pool?.metadata?.namespace ?? namespace}
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Capacity
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 500 }}>
                {capDisp}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Used Space
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 500 }}>
                {usedDisp}
                {usagePct !== undefined ? ` (${usagePct}% of total)` : ''}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Available Space
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 500 }}>
                {availDisp}
                {usagePct !== undefined ? ` (${100 - usagePct}% remaining)` : ''}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: 2, backgroundColor: 'action.hover', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            Pool Details
          </Typography>
        </Box>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 500, width: '30%' }}>Name</TableCell>
              <TableCell>{pool.metadata?.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Node</TableCell>
              <TableCell>{pool.spec?.node ?? '-'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Namespace</TableCell>
              <TableCell>{pool.metadata?.namespace ?? namespace}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Disks</TableCell>
              <TableCell>
                {Array.isArray(pool.spec?.disks) ? pool.spec.disks.join(', ') : '-'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Status</TableCell>
              <TableCell>{pool.status?.pool_status ?? 'Unknown'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Encrypted</TableCell>
              <TableCell>{pool.status?.encrypted ? 'Yes' : 'No'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Capacity (display)</TableCell>
              <TableCell>{pool.status?.capacity_q ?? '-'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Used (display)</TableCell>
              <TableCell>{pool.status?.used_q ?? '-'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Available (display)</TableCell>
              <TableCell>{pool.status?.available_q ?? '-'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

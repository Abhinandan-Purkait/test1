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
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { zfsNodeClass } from '../../../resources/zfsnode';
import { formatIBytes, sumFormatIBytes } from '../../utils/humanize_size';
import { CapacityGaugeTrio } from '../../utils/CapacityGauge';

export function ZFSPoolDetail() {
  const {
    namespace,
    node: nodeName,
    pool: poolName,
  } = useParams<{ namespace: string; node: string; pool: string }>();
  const [poolData, setPoolData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();

  useEffect(() => {
    const ZfsNode = zfsNodeClass();
    const fetchNode = ZfsNode.apiGet(
      (node: any) => {
        if (node) {
          const pools = node.pools || node.jsonData?.pools || node.spec?.pools || [];
          const matchingPool = pools.find((p: any) => p.name === poolName);
          if (matchingPool) {
            setPoolData(matchingPool);
          } else {
            setError(`Pool ${poolName} not found in node ${nodeName}`);
          }
        } else {
          setError(`Node ${nodeName} not found in namespace ${namespace}`);
        }
        setLoading(false);
      },
      nodeName,
      namespace,
      (err: any) => {
        setError(`Error loading node: ${err?.message || 'Unknown error'}`);
        setLoading(false);
      },
    );

    const unsubscribePromise = fetchNode();
    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, [namespace, nodeName, poolName]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading Pool Details...</Typography>
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

  if (!poolData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No pool data available.</Typography>
      </Box>
    );
  }

  const freeBytes = formatIBytes(poolData.free);
  const usedBytes = formatIBytes(poolData.used);
  const sizeBytes = sumFormatIBytes([freeBytes, usedBytes]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Button onClick={() => history.goBack()} sx={{ mb: 2 }} variant="text">
          ← Back
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 500 }}>
            ZFS Pool: {poolName}
          </Typography>
        </Box>

        <Typography color="text.secondary">
          Node: {nodeName} • Namespace: {namespace}
        </Typography>
      </Box>

      <CapacityGaugeTrio title="" total={sizeBytes} used={usedBytes} free={freeBytes} />

      <Paper sx={{ overflow: 'hidden' }}>
        <Box
          sx={{ p: 2, backgroundColor: 'action.hover', borderBottom: 1, borderColor: 'divider' }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            Pool Details
          </Typography>
        </Box>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 500, width: '30%' }}>Pool Name</TableCell>
              <TableCell>{poolName}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Node</TableCell>
              <TableCell>{nodeName}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Namespace</TableCell>
              <TableCell>{namespace}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>UUID</TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {poolData.uuid}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Free Space</TableCell>
              <TableCell>{freeBytes}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Used Space</TableCell>
              <TableCell>{usedBytes}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Total Size</TableCell>
              <TableCell>{sizeBytes}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

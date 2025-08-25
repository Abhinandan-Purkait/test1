import { Box, Button, Paper, Table, TableBody, TableCell, TableRow, Typography, Chip, Grid, Card, CardContent, LinearProgress } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { lvmNodeClass } from '../../../resources/lvmnode';

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

export function LVMVolumeGroupDetail() {
  const { namespace, node: nodeName, vg: vgName } = useParams<{ namespace: string; node: string; vg: string }>();
  const [vgData, setVgData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();

  useEffect(() => {
    const LvmNode = lvmNodeClass();
    const fetchNode = LvmNode.apiGet(
      (node: any) => {
        if (node) {
          const vgs = node.volumeGroups || node.jsonData?.volumeGroups || node.spec?.volumeGroups || [];
          const matchingVg = vgs.find((vg: any) => vg.name === vgName);
          if (matchingVg) {
            setVgData(matchingVg);
          } else {
            setError(`Volume Group ${vgName} not found in node ${nodeName}`);
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
      }
    );

    const unsubscribePromise = fetchNode();
    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, [namespace, nodeName, vgName]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading Volume Group Details...</Typography>
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

  if (!vgData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No volume group data available.</Typography>
      </Box>
    );
  }

  const freeBytes = parseSize(vgData.free || '0');
  const sizeBytes = parseSize(vgData.size || '0');
  const usedBytes = sizeBytes - freeBytes;
  const usagePercent = sizeBytes > 0 ? Math.round((usedBytes / sizeBytes) * 100) : 0;
  const metadataFreeBytes = parseSize(vgData.metadataFree || '0');
  const metadataSizeBytes = parseSize(vgData.metadataSize || '0');

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          onClick={() => history.goBack()}
          sx={{ mb: 2 }}
          variant="text"
        >
          ← Back
        </Button>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 500 }}>
            LVM Volume Group: {vgName}
          </Typography>
        </Box>
        
        <Typography color="text.secondary">
          Node: {nodeName} • Namespace: {namespace}
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
                {formatBytes(sizeBytes)}
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
                {formatBytes(usedBytes)}({usagePercent}% of total)
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
                {formatBytes(freeBytes)}({100 - usagePercent}% remaining)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: 2, backgroundColor: 'action.hover', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            Volume Group Details
          </Typography>
        </Box>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 500, width: '30%' }}>Volume Group Name</TableCell>
              <TableCell>{vgName}</TableCell>
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
                  {vgData.uuid}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Free Space</TableCell>
              <TableCell>{formatBytes(freeBytes)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Used Space</TableCell>
              <TableCell>{formatBytes(usedBytes)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Total Size</TableCell>
              <TableCell>{formatBytes(sizeBytes)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Allocation Policy</TableCell>
              <TableCell>{vgData.allocationPolicy}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>LV Count</TableCell>
              <TableCell>{vgData.lvCount}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Max LV</TableCell>
              <TableCell>{vgData.maxLv}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Max PV</TableCell>
              <TableCell>{vgData.maxPv}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>PV Count</TableCell>
              <TableCell>{vgData.pvCount}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Snap Count</TableCell>
              <TableCell>{vgData.snapCount}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Metadata Size</TableCell>
              <TableCell>{formatBytes(metadataSizeBytes)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Metadata Free</TableCell>
              <TableCell>{formatBytes(metadataFreeBytes)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Metadata Count</TableCell>
              <TableCell>{vgData.metadataCount}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Metadata Used Count</TableCell>
              <TableCell>{vgData.metadataUsedCount}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Missing PV Count</TableCell>
              <TableCell>{vgData.missingPvCount}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Permissions</TableCell>
              <TableCell>
                {vgData.permissions} 
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

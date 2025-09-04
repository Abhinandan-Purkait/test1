// src/components/common/CapacityGauge.tsx
import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { formatIBytes, toBytesSafe } from './humanize_size';

function Ring({
  percent,
  size = 96,
  thickness = 8,
  usedColor = '#f44336',
  freeColor = '#4caf50',
}: {
  percent: number;
  size?: number;
  thickness?: number;
  usedColor?: string;
  freeColor?: string;
}) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={thickness}
        sx={{ color: t => t.palette.action.hover }}
      />
      <CircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={thickness}
        sx={{ color: freeColor, position: 'absolute', left: 0 }}
      />
      <CircularProgress
        variant="determinate"
        value={p}
        size={size}
        thickness={thickness}
        sx={{ color: usedColor, position: 'absolute', left: 0 }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {p}%
        </Typography>
      </Box>
    </Box>
  );
}

export function CapacityGaugeTrio({
  total,
  used,
  free,
  title = 'Capacity',
  sx,
}: {
  total: string | number | null | undefined;
  used: string | number | null | undefined;
  free: string | number | null | undefined;
  title?: string;
  sx?: any;
}) {
  const totalBytes = toBytesSafe(total);
  const usedBytes = toBytesSafe(used);
  const freeBytes = toBytesSafe(free);
  const safeTotal = totalBytes > 0 ? totalBytes : usedBytes + freeBytes;
  const safeUsed = Math.min(usedBytes, safeTotal);
  const safeFree = Math.max(0, safeTotal - safeUsed);
  const usedPct = safeTotal ? Math.round((safeUsed / safeTotal) * 100) : 0;
  const freePct = 100 - usedPct;

  return (
    <Box sx={{ ...sx, mb: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Total
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {formatIBytes(safeTotal)}
              </Typography>
              <Box sx={{ flex: 1 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Ring percent={usedPct} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Used of Total
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {formatIBytes(safeUsed)} of {formatIBytes(safeTotal)} ({usedPct}%)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Ring percent={freePct} usedColor="#4caf50" freeColor="#f44336" />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Free of Total
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {formatIBytes(safeFree)} of {formatIBytes(safeTotal)} ({freePct}%)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

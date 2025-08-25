import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import React from 'react';

export type StorageEngine = 'mayastor' | 'lvm' | 'zfs';

interface StorageSelectorProps {
  value: StorageEngine;
  onChange: (engine: StorageEngine) => void;
  title?: string;
  description?: string;
}

export function StorageSelector({
  value,
  onChange,
  title,
  description
}: StorageSelectorProps) {
  const handleChange = (event: SelectChangeEvent<StorageEngine>) => {
    onChange(event.target.value as StorageEngine);
  };

  return (
    <Box sx={{
      px: 2,
      py: 2,
      backgroundColor: 'background.paper',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      mr: 2
    }}>
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 500,
            color: 'text.primary'
          }}
        >
          {title}
        </Typography>
        {description && (
          <Typography
            variant="caption"
            color="text.secondary"
          >
            {description}
          </Typography>
        )}
      </Box>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="storage-engine-select-label">Storage Engine</InputLabel>
          <Select
            labelId="storage-engine-select-label"
            id="storage-engine-select"
            value={value}
            label="Storage Engine"
            onChange={handleChange}
            size="small"
          >
            <MenuItem value="mayastor">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#1976d2'
                  }}
                />
                Mayastor
              </Box>
            </MenuItem>
            <MenuItem value="lvm">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#388e3c'
                  }}
                />
                LVM
              </Box>
            </MenuItem>
            <MenuItem value="zfs">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#f57c00'
                  }}
                />
                ZFS
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}

export function useStorageEngine(defaultEngine: StorageEngine = 'zfs'): [StorageEngine, (engine: StorageEngine) => void] {
  const [engine, setEngine] = React.useState<StorageEngine>(defaultEngine);

  const updateEngine = React.useCallback((newEngine: StorageEngine) => {
    setEngine(newEngine);
  }, []);

  return [engine, updateEngine];
}

import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

export type StorageEngine = 'mayastor' | 'lvm' | 'zfs' | 'hostpath';

type EngineMeta = {
  label: string;
  dotColor: string;
};

const ENGINE_META: Record<StorageEngine, EngineMeta> = {
  mayastor: { label: 'Mayastor', dotColor: '#1976d2' },
  lvm: { label: 'LVM', dotColor: '#388e3c' },
  zfs: { label: 'ZFS', dotColor: '#6a1b9a' },
  hostpath: { label: 'Hostpath', dotColor: '#9a8d1bff' },
};

const DEFAULT_VARIANTS: StorageEngine[] = ['mayastor', 'lvm', 'zfs'];

export interface StorageSelectorProps {
  value: StorageEngine;
  onChange: (engine: StorageEngine) => void;
  title?: string;
  description?: string;
  variants?: StorageEngine[]; // if not passed, defaults to mayastor/lvm/zfs
}

const ENGINE_PARAM = 'engine';
const LS_KEY = 'puls8.selectedEngine';

function parseEngine(v: unknown, allowed?: StorageEngine[]): StorageEngine | null {
  if (typeof v !== 'string') return null;
  const lower = v.toLowerCase() as StorageEngine;
  const isKnown = lower === 'mayastor' || lower === 'lvm' || lower === 'zfs' || lower === 'hostpath';
  if (!isKnown) return null;
  if (allowed && allowed.length > 0 && !allowed.includes(lower)) return null;
  return lower;
}

function safeGetSearch(locationSearch: string): URLSearchParams {
  try {
    return new URLSearchParams(locationSearch || '');
  } catch {
    return new URLSearchParams();
  }
}

function safeSetLocalStorage(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    /* noop */
  }
}

function safeGetLocalStorage(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    return null;
  }
  return null;
}

function ensureAllowedEngine(
  candidate: StorageEngine | null,
  allowed: StorageEngine[],
  fallback: StorageEngine,
): StorageEngine {
  if (candidate && allowed.includes(candidate)) return candidate;
  if (allowed.includes(fallback)) return fallback;
  return allowed ?? fallback;
}

export function StorageSelector({
  value,
  onChange,
  title,
  description,
  variants,
}: StorageSelectorProps) {
  const engines = (variants && variants.length > 0 ? variants : DEFAULT_VARIANTS) as StorageEngine[];

  const handleChange = (event: SelectChangeEvent) => {
    const next = event.target.value as StorageEngine;
    if (next === value) return;
    onChange(next);
  };

  return (
    <Box
      sx={{
        px: 2,
        py: 2,
        backgroundColor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        mr: 2,
      }}
    >
      <Box>
        {title ? (
          <Typography variant="h6" sx={{ fontWeight: 500, color: 'text.primary' }}>
            {title}
          </Typography>
        ) : null}
        {description ? (
          <Typography variant="caption" color="text.secondary">
            {description}
          </Typography>
        ) : null}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FormControl sx={{ minWidth: 200 }} size="small" variant="outlined">
          <InputLabel id="storage-engine-select-label">Storage Engine</InputLabel>
          <Select
            labelId="storage-engine-select-label"
            id="storage-engine-select"
            value={value}
            label="Storage Engine"
            onChange={handleChange}
            autoWidth
          >
            {engines.map((eng) => {
              const meta = ENGINE_META[eng];
              return (
                <MenuItem key={eng} value={eng}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: meta.dotColor }} />
                    {meta.label}
                  </Box>
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}

type UseStorageEngineOptions = {
  defaultEngine?: StorageEngine;
  variants?: StorageEngine[];
};

export function useStorageEngine(
  options?: UseStorageEngineOptions,
): [StorageEngine, (engine: StorageEngine) => void] {
  const history = useHistory();
  const location = useLocation();

  const defaultEngine: StorageEngine = options?.defaultEngine ?? 'mayastor';
  const allowed = React.useMemo<StorageEngine[]>(
    () => (options?.variants && options.variants.length > 0 ? options.variants : DEFAULT_VARIANTS),
    [options?.variants],
  );

  const getInitial = React.useCallback((): StorageEngine => {
    const params = safeGetSearch(location.search);
    const fromUrl = parseEngine(params.get(ENGINE_PARAM), allowed);
    if (fromUrl) return ensureAllowedEngine(fromUrl, allowed, defaultEngine);

    const fromLs = parseEngine(safeGetLocalStorage(LS_KEY), allowed);
    if (fromLs) return ensureAllowedEngine(fromLs, allowed, defaultEngine);

    return ensureAllowedEngine(defaultEngine, allowed, allowed);
  }, [location.search, defaultEngine, allowed]);

  const [engine, setEngine] = React.useState<StorageEngine>(getInitial);

  React.useEffect(() => {
    const params = safeGetSearch(location.search);
    const urlEngine = parseEngine(params.get(ENGINE_PARAM), allowed);
    if (urlEngine && urlEngine !== engine) {
      setEngine(urlEngine);
      safeSetLocalStorage(LS_KEY, urlEngine);
    }
  }, [location.search, engine, allowed]);

  const update = React.useCallback(
    (next: StorageEngine) => {
      if (next === engine) return;
      const safeNext = ensureAllowedEngine(next, allowed, engine);
      const params = safeGetSearch(location.search);
      params.set(ENGINE_PARAM, safeNext);
      try {
        history.replace({ ...location, search: params.toString() });
      } catch {
        /* noop */
      }
      safeSetLocalStorage(LS_KEY, safeNext);
      setEngine(safeNext);
    },
    [engine, history, location, allowed],
  );

  React.useEffect(() => {
    const params = safeGetSearch(location.search);
    const urlEngine = parseEngine(params.get(ENGINE_PARAM), allowed);
    if (!urlEngine || urlEngine !== engine) {
      params.set(ENGINE_PARAM, engine);
      try {
        history.replace({ ...location, search: params.toString() });
      } catch {
        /* noop */
      }
    }
    safeSetLocalStorage(LS_KEY, engine);
  }, [engine, history, location, allowed]);

  React.useEffect(() => {
    if (!allowed.includes(engine)) {
      const coerced = ensureAllowedEngine(engine, allowed, allowed);
      if (coerced !== engine) {
        const params = safeGetSearch(location.search);
        params.set(ENGINE_PARAM, coerced);
        try {
          history.replace({ ...location, search: params.toString() });
        } catch {
          /* noop */
        }
        safeSetLocalStorage(LS_KEY, coerced);
        setEngine(coerced);
      }
    }
  }, [allowed, engine, history, location]);

  return [engine, update];
}

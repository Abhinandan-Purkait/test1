const IEC_UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'] as const;
type IecUnit = (typeof IEC_UNITS)[number];

const SI_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const;

function normalizeUnit(raw: string | null | undefined): { base: 'iec' | 'si' | null; idx: number } {
  if (!raw) return { base: null, idx: 0 };
  const u = raw.replace(/[^a-z]/gi, '').toLowerCase();

  const iecIndex =
    u === 'b'
      ? 0
      : u === 'kib' || u === 'ki'
        ? 1
        : u === 'mib' || u === 'mi'
          ? 2
          : u === 'gib' || u === 'gi'
            ? 3
            : u === 'tib' || u === 'ti'
              ? 4
              : u === 'pib' || u === 'pi'
                ? 5
                : -1;
  if (iecIndex >= 0) return { base: 'iec', idx: iecIndex };

  const siIndex =
    u === 'kb' || u === 'k'
      ? 1
      : u === 'mb' || u === 'm'
        ? 2
        : u === 'gb' || u === 'g'
          ? 3
          : u === 'tb' || u === 't'
            ? 4
            : u === 'pb' || u === 'p'
              ? 5
              : u === 'b'
                ? 0
                : -1;
  if (siIndex >= 0) return { base: 'si', idx: siIndex };

  return { base: null, idx: 0 };
}

function toBytesInternal(input: string | number | null | undefined): number {
  if (input == null) return 0;
  if (typeof input === 'number') {
    if (!Number.isFinite(input) || input <= 0) return 0;
    return Math.floor(input);
  }
  const s = String(input).trim();
  if (s.length === 0) return 0;

  const m = s.match(/^([\d]+(?:\.[\d]+)?)\s*([a-zA-Z]*)$/);
  if (!m) return 0;

  const value = Number(m[1]);
  if (!Number.isFinite(value) || value < 0) return 0;

  const unit = m[2] || '';
  const { base, idx } = normalizeUnit(unit);

  if (base === 'iec') return Math.round(value * Math.pow(1024, idx));
  if (base === 'si') return Math.round(value * Math.pow(1000, idx));
  return Math.round(value);
}

export function toBytesSafe(input: string | number | null | undefined): number {
  const n = toBytesInternal(input);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function formatIBytes(input: string | number | null | undefined): string {
  const bytes = toBytesSafe(input);
  if (bytes === 0) return '0 B';

  const k = 1024;
  let i = Math.floor(Math.log(bytes) / Math.log(k));
  if (i < 0) i = 0;
  if (i >= IEC_UNITS.length) i = IEC_UNITS.length - 1;

  const scaled = bytes / Math.pow(k, i);
  const out = scaled
    .toFixed(2)
    .replace(/\.00$/, '')
    .replace(/(\.\d)0$/, '$1');
  return `${out} ${IEC_UNITS[i]}`;
}

export function sumFormatIBytes(values: Array<string | number | null | undefined>): string {
  const total = values.reduce<number>((acc, v) => acc + toBytesSafe(v), 0);
  return formatIBytes(total);
}

import type { Player } from '@/types';

/** "Kevin De Bruyne" -> "KB". Falls back to two letters for mononyms. */
export function initialsOf(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatHeight(height: number) {
  return `${height.toFixed(2)} m`;
}

/** The "Age 39 · Argentina" line used on the player cards. */
export function subtitleFor(player: Player) {
  return `Age ${player.age} · ${player.nationality}`;
}

/** 214211951 -> "214.2M", 5401 -> "5.4K". */
export function formatCompact(value: number) {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return String(value);
}

/** 214211951 -> "214,211,951". */
export function formatThousands(value: number) {
  return value.toLocaleString('en-US');
}

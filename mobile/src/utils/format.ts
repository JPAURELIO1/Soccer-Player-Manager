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

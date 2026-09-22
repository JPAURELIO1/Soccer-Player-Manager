import { request } from '@/api/client';
import type { Player, PlayerFormValues } from '@/types';

const ENDPOINT = 'players.php';

/** Strips the " m" suffix a user might type into the height box. */
function toApiPayload(values: PlayerFormValues) {
  return {
    full_name: values.full_name.trim(),
    age: values.age.trim(),
    jersey_number: values.jersey_number.trim(),
    nationality: values.nationality.trim(),
    team: values.team.trim(),
    position: values.position,
    preferred_foot: values.preferred_foot,
    height: values.height.trim(),
    photo: values.photo ?? '',
    description: values.description.trim(),
  };
}

export function listPlayers(search?: string, signal?: AbortSignal) {
  return request<Player[]>(ENDPOINT, { query: { search }, signal });
}

export function getPlayer(id: number, signal?: AbortSignal) {
  return request<Player>(ENDPOINT, { query: { id }, signal });
}

export function createPlayer(values: PlayerFormValues) {
  return request<Player>(ENDPOINT, { method: 'POST', body: toApiPayload(values) });
}

export function updatePlayer(id: number, values: PlayerFormValues) {
  return request<Player>(ENDPOINT, { method: 'PUT', query: { id }, body: toApiPayload(values) });
}

export function deletePlayer(id: number) {
  return request<{ id: number }>(ENDPOINT, { method: 'DELETE', query: { id } });
}

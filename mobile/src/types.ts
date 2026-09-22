export const POSITIONS = ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'] as const;
export const PREFERRED_FEET = ['Left', 'Right', 'Both'] as const;

export type Position = (typeof POSITIONS)[number];
export type PreferredFoot = (typeof PREFERRED_FEET)[number];

/** A player exactly as the API returns it. */
export type Player = {
  id: number;
  full_name: string;
  age: number;
  jersey_number: number;
  nationality: string;
  team: string;
  position: Position;
  preferred_foot: PreferredFoot;
  height: number;
  /** Base64 data URI, or null when the player uses an initials avatar. */
  photo: string | null;
  description: string;
  created_at: string;
  updated_at: string;
};

/**
 * What the form collects. Everything is a string because that is what
 * TextInput gives us; the API parses and validates the numbers.
 */
export type PlayerFormValues = {
  full_name: string;
  age: string;
  jersey_number: string;
  nationality: string;
  team: string;
  position: Position | '';
  preferred_foot: PreferredFoot | '';
  height: string;
  photo: string | null;
  description: string;
};

export const emptyPlayerForm: PlayerFormValues = {
  full_name: '',
  age: '',
  jersey_number: '',
  nationality: '',
  team: '',
  position: '',
  preferred_foot: '',
  height: '',
  photo: null,
  description: '',
};

/** Turns an API player back into editable form values. */
export function playerToForm(player: Player): PlayerFormValues {
  return {
    full_name: player.full_name,
    age: String(player.age),
    jersey_number: String(player.jersey_number),
    nationality: player.nationality,
    team: player.team,
    position: player.position,
    preferred_foot: player.preferred_foot,
    height: player.height.toFixed(2),
    photo: player.photo,
    description: player.description,
  };
}
